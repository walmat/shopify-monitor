const EventEmitter = require('eventemitter3');
const shortid = require('shortid');

const Monitor = require('../monitors/monitor');
const { WebhookManager } = require('../hooks');
const { Events } = require('../utils/constants').Manager;

class Manager {
  constructor(store) {
    this._events = new EventEmitter();

    this._monitors = {};
    this._handlers = {};
    this._webhookManager = new WebhookManager();
    this._store = store;
  }

  async handleNotifyProduct(product, type, webhooks) {
    const _product = { ...product };
    _product.notifiedWebhooks = product.notifiedWebhooks || [];
    try {
      const existingProducts = await this._store.products.browse();
      const existingProduct = existingProducts.find(p => p.url === _product.url);
      if (existingProduct) {
        // Update starting point of notified webhooks so we save the data between updates
        _product.notifiedWebhooks = existingProduct.notifiedWebhooks;
        _product.id = existingProduct.id;
      }
    } catch (_) {
      // fail silently...
    }

    webhooks.forEach(w => {
      // Send a webhook and add an entry for the webhook in our notified list
      this._webhookManager.sendWebhook(_product, type, w.url);
      _product.notifiedWebhooks.push({
        type,
        url: w.url,
      });
    });

    // Update the store with the new product data
    return this._store.products.edit(product.id, _product);
  }

  /**
   * Handler for setting up any pre-requisites for the monitor process
   * @param {String} site - store to setup the monitoring process for
   */
  async setup() {
    let id;
    do {
      id = shortid.generate();
    } while (this._monitors[id]);
    const proxies = await this._store.proxies.browse();
    return { id, proxies };
  }

  /**
   * Handler for cleaning up any leftover data for the monitoring process
   * @param {String} id - store id
   */
  cleanup(id) {
    delete this._monitors[id];
  }

  /**
   * Start a monitor process
   *
   * This method starts a given monitor if it has not already been started. The
   * requisite data is generated (id, open proxy if it is available, etc.) and
   * starts the monitor asynchronously.
   *
   * If the given monitor has already started, we attempt to compare
   * data being monitored. One of two cases can happen:
   * 1. We have new keywords that we wish to include, so we create a new monitor process
   * 2. We have similar keywords, so we negate creating the monitor process
   * @param {Object} data - mapped from `monitorInfo` in `packages/structures/src/definitions/monitorInfo.js`
   */
  async start(data) {
    // Find an existing monitor based on the site
    const existingMonitor = Object.values(this._monitors).find(s => s.site.url === data.site.url);
    if (existingMonitor) {
      if (existingMonitor.monitorIds.includes(data.id)) {
        // Existing monitor also includes the same data id, so we're already monitoring
        return;
      }

      // Emit an event to send the data to the monitor
      this._events.emit(Events.AddMonitorData, existingMonitor.id, data);
      return;
    }

    const { id, proxies } = await this.setup(data.site.url);

    this._start([id, data, proxies]).then(() => {
      this.cleanup(id);
    });
  }

  /**
   * Start multiple monitor processes
   *
   * This method is a convenience method to start multiple monitors
   * with a single call. The `start()` method is called for all
   * stores in the given list.
   *
   * @param {List<Object>} monitors list of monitors to start
   */
  startAll(monitors) {
    [...monitors].forEach(m => this.start(m));
  }

  /**
   * Update existing monitor info
   * @param {MonitorInfo} data monitor info object to update
   */
  update(data) {
    // Find an existing monitor based on the site
    const existingMonitor = Object.values(this._monitors).find(s => s.site.url === data.site.url);
    if (existingMonitor) {
      if (existingMonitor.monitorIds.includes(data.id)) {
        // Existing monitor was tracking the data, emit an update event
        this._events.emit(Events.UpdateMonitorData, existingMonitor.id, data);
      } else {
        // Existing monitor was not tracking the data, emit an add event
        this._events.emit(Events.AddMonitorData, existingMonitor.id, data);
      }
    }
    // Existing monitor doesn't exist, throw an error
    throw new Error('Failed to update! Data was not previously tracked before.');
  }

  /**
   * Stop a monitor process
   *
   * This method stops a given monitor if it is running. This is done by sending
   * an abort signal to force the process to stop and cleanup anything it needs
   * to.
   *
   * This method does nothing if the given process has already stopped or
   * if it was never started.
   *
   * @param {Object} data the monitor data to stop
   */
  stop(data, options = {}) {
    const existingMonitor = Object.values(this._monitors).find(s => s.site.url === data.site.url);
    if (!existingMonitor || !existingMonitor.monitorIds.includes(data.id)) {
      // No monitor was found or existing monitor did not include the monitor data,
      // so we don't need to do anything
      return null;
    }

    if (existingMonitor.monitorIds.length === 1 || options.force) {
      // Existing monitor includes the monitor data, and there is only one left -- we can abort the
      // monitor OR the force option is passed
      this._events.emit(Events.Abort, existingMonitor.id);
    } else {
      // Existing monitor includes the monitor data, as well as other monitor data objects, so we should
      // remove the given monitor data, but not abort the whole monitor
      this._events.emit(Events.RemoveMonitorData, existingMonitor.id, data);
    }
    return existingMonitor.id;
  }

  /**
   * Stop multiple monitor processes
   *
   * This method is a convenience method to stop multiple monitors
   * with a single call. The `stop()` method is called for all
   * processes in the given list.
   *
   * @param {List<Object>} monitors - monitors to stop
   * @param {Map} options - options associated with stopping processes
   */
  stopAll(monitors, { force = false, wait = false }) {
    let monitorsToStop = monitors;

    if (force) {
      // Choose one monitor data group from each monitor so we don't try to force stop
      // a single monitor process multiple times
      monitorsToStop = Object.values(this._monitors).map(({ monitorIds }) => monitorIds[0]);
    }
    return [...monitorsToStop].map(m => this.stop(m, { wait, force }));
  }

  /**
   * Check if a monitor is running
   * @param {Object} monitor the monitor to check
   */
  isRunning(monitorData) {
    return !!this._monitors.find(m => m.monitorIds.includes(monitorData.id));
  }

  /**
   * :: PRIVATE ::
   * Handler for wiring events to monitor
   * @param {Object} monitor - monitor object
   */
  _setup(monitor) {
    const mId = monitor.id;
    const handlerGenerator = (event, sideEffects) => (id, ...params) => {
      if (id === mId || id === 'ALL') {
        const args = [mId, ...params];
        if (sideEffects) {
          sideEffects.apply(this, args);
        }
        monitor._events.emit(event, ...args);
      }
    };

    const handlers = {};

    // Generate Handlers for each event
    [
      Events.Abort,
      Events.AddMonitorData,
      Events.RemoveMonitorData,
      Events.UpdateMonitorData,
    ].forEach(event => {
      let handler;
      switch (event) {
        case Events.AddMonitorData: {
          const sideEffects = (id, data) => {
            this._monitors[id].monitorIds.push(data.id);
          };
          handler = handlerGenerator(Events.AddMonitorData, sideEffects);
          break;
        }
        case Events.RemoveMonitorData: {
          const sideEffects = (id, data) => {
            this._monitors[id].monitorIds = this._monitors[id].monitorIds.filter(id !== data.id);
          };
          handler = handlerGenerator(Events.RemoveMonitorData, sideEffects);
          break;
        }
        default: {
          handler = handlerGenerator(event, null);
          break;
        }
      }
      handlers[event] = handler;
      this._events.on(event, handler, this);
    });
    this._handlers[monitor.id] = handlers;

    monitor._events.on(Monitor.Events.NotifyProduct, this.handleNotifyProduct, this);
  }

  /**
   * :: PRIVATE ::
   * Handler for cleaning up a monitor process
   * @param {Object} monitor - monitor object
   */
  _cleanup(monitor) {
    const handlers = this._handlers[monitor.id];
    delete this._handlers[monitor.id];
    monitor._events.removeAllListeners();

    [
      Events.Abort,
      Events.AddMonitorData,
      Events.RemoveMonitorData,
      Events.UpdateMonitorData,
    ].forEach(event => {
      this._events.removeListener(event, handlers[event]);
    });
  }

  /**
   * :: PRIVATE ::
   * Handler for starting a monitor process
   * @param {List} param0 [monitor id, monitor data]
   */
  async _start([id, data, proxies]) {
    const monitor = new Monitor(id, data, proxies);

    // monitor.site = monitor.site.url;
    this._monitors[id] = monitor;

    this._setup(monitor);

    try {
      await monitor.start();
    } catch (error) {
      // fail silently...
    }

    this._cleanup(monitor);
  }
}

Manager.Events = Events;

module.exports = Manager;

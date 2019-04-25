const EventEmitter = require('eventemitter3');
const shortid = require('shortid');

const Monitor = require('./monitor');
const ProxyManager = require('./proxy');
const { Events } = require('./utils/constants').Manager;

class Manager {
  constructor() {
    this._events = new EventEmitter();

    this._monitors = {};
    this._handlers = {};
    this._proxyManager = new ProxyManager();

    this.mergeStatusUpdates = this.mergeStatusUpdates.bind(this);
  }

  /**
   * Handler for creating a listener for monitor events
   * @param {Function} cb - callback function (handler)
   */
  registerForMonitorEvents(cb) {
    this._events.on('status', cb);
  }

  /**
   * Handler for removing the listener for monitor events
   * @param {Function} cb - callback function (handler)
   */
  deregisterForMonitorEvents(cb) {
    this._events.removeListener('status', cb);
  }

  /**
   * Handler for emitting the swapped proxy event
   * @param {String} id - monitor id that is listening on the event
   * @param {Object} proxy - old proxy being used
   * @param {Boolean} shouldBan - whether or not we should ban the old proxy
   */
  async handleProxySwap(id, proxy, shouldBan) {
    const proxyId = proxy ? proxy.id : null;
    const { site } = this._monitors[id];
    const newProxy = await this._proxyManager.swap(proxyId, site, shouldBan);
    this._events.emit(Events.SendProxy, id, newProxy);
  }

  /**
   * Merges outgoing status updates for stores
   * @param {String} monitorId - id for the monitor process emitting the event
   * @param {Object} status - the new status being emitted
   * @param {Any} event - any args passed through
   */
  mergeStatusUpdates(monitorId, status, event) {
    if (event === Events.Status) {
      const { id } = this._monitors[monitorId];
      this._events.emit('status', id, status, event);
    }
  }

  /**
   * Changes the delay for a list of stores
   * @param {List} stores - list of stores to change the delay
   * @param {Number} delay - new delay
   * @param {String} type - type of delay
   */
  changeDelay(stores, delay, type) {
    stores.forEach(s => this._events.emit(Events.ChangeDelay, s, delay, type));
  }

  /**
   * Changes the webhook for a list of stores
   * @param {List<Object>} stores - list of stores to change the webhook
   * @param {} hook - new webhook
   * @param {*} type - type of webhook
   */
  changeWebhook(stores, hook, type) {
    stores.forEach(s => this._events.emit(Events.ChangeWebhook, s, hook, type));
  }

  /**
   * Handler for setting up any pre-requisites for the monitor process
   * @param {String} site - store to setup the monitoring process for
   */
  async setup(site) {
    // TODO: find matching stores somehow and group them together
    let id;
    do {
      id = shortid.generate();
    } while (this._monitors[id]);
    const openProxy = await this._proxyManager.reserve(site);
    return { id, openProxy };
  }

  /**
   * Handler for cleaning up any leftover data for the monitoring process
   * @param {String} id - store id
   */
  cleanup(id) {
    const { proxy, site } = this._monitors[id];
    delete this._monitors[id];
    if (proxy) {
      this._proxyManager.release(proxy.id, site, true);
    }
  }

  /**
   * Start a monitor process
   *
   * This method starts a given store if it has not already been started. The
   * requisite data is generated (id, open proxy if it is available, etc.) and
   * starts the monitor asynchronously.
   *
   * If the given store has already started, we attempt to compare
   * data being monitored. One of two cases can happen:
   * 1. We have new keywords that we wish to include, so we create a new monitor process
   * 2. We have similar keywords, so we negate creating the monitor process
   * @param {Object} data - mapped from `monitorInfo` in `packages/structures/src/definitions/monitorInfo.js`
   */
  async start(data) {
    const alreadyStarted = Object.values(this._monitors).find(s => s.id === data.id);
    if (alreadyStarted) {
      return;
    }
    const { id, openProxy } = await this.setup(data.site.url);

    this._start([id, data, openProxy]).then(() => {
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
   * Stop a monitor process
   *
   * This method stops a given monitor if it is running. This is done by sending
   * an abort signal to force the process to stop and cleanup anything it needs
   * to.
   *
   * This method does nothing if the given process has already stopped or
   * if it was never started.
   *
   * @param {Object} data the task to stop
   */
  stop(data) {
    const id = Object.keys(this._monitors).find(k => this._monitors[k].id === data.id);
    if (!id) {
      return null;
    }

    // Send abort signal
    this._events.emit(Events.Abort, id);
    return id;
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
      monitorsToStop = Object.values(this._monitors).map(({ id }) => ({ id }));
    }
    return [...monitorsToStop].map(m => this.stop(m, { wait }));
  }

  /**
   * Check if a monitor is running
   * @param {Object} monitor the monitor to check
   */
  isRunning(monitor) {
    return !!this._monitors.find(m => m.id === monitor.id);
  }

  /**
   * :: PRIVATE ::
   * Handler for wiring events to monitor
   * @param {Object} monitor - monitor object
   */
  _setup(monitor) {
    const handlerGenerator = (event, sideEffects) => (id, ...params) => {
      if (id === monitor.id || id === 'ALL') {
        const args = [monitor.id, ...params];
        if (sideEffects) {
          sideEffects.apply(this, args);
        }
        monitor._events.emit(event, ...args);
      }
    };

    const handlers = {};

    // Generate Handlers for each event
    [Events.Abort, Events.SendProxy, Events.ChangeDelay, Events.ChangeWebhook].forEach(event => {
      let handler;
      switch (event) {
        case Events.Abort: {
          handler = id => {
            if (id === monitor.id || id === 'ALL') {
              monitor._handleAbort(monitor.id);
            }
          };
          break;
        }
        case Events.SendProxy: {
          const sideEffects = (id, proxy) => {
            this._monitors[id].proxy = proxy;
          };
          handler = handlerGenerator(Monitor.Events.ReceiveProxy, sideEffects);
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

    monitor.registerForEvent(Monitor.Events.Status, this.mergeStatusUpdates);
    monitor._events.on(Monitor.Events.SwapProxy, this.handleProxySwap, this);
  }

  /**
   * :: PRIVATE ::
   * Handler for cleaning up a monitor process
   * @param {Object} monitor - monitor object
   */
  _cleanup(monitor) {
    const handlers = this._handlers[monitor.id];
    delete this._handlers[monitor.id];
    monitor.deregisterForEvent(Monitor.Events.Status, this.mergeStatusUpdates);
    monitor._events.removeAllListeners();

    [Events.Abort, Events.SendProxy, Events.ChangeDelay, Events.ChangeWebhook].forEach(event => {
      this._events.removeListener(event, handlers[event]);
    });
  }

  /**
   * :: PRIVATE ::
   * Handler for starting a monitor process
   * @param {List} param0 [monitor id, monitor data, proxy]
   */
  async _start([id, data, proxy]) {
    const monitor = new Monitor(id, data, proxy);
    if (!monitor) {
      return;
    }
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

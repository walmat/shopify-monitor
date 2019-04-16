/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
const EventEmitter = require('eventemitter3');
const hash = require('object-hash');
const shortid = require('shortid');

const Monitor = require('./monitor');
const { Events } = require('./constants').Manager;

const BANNED_PROXY_TIMEOUT = 120000;
const PROXY_RETRY_TIMEOUT = 100;

class Manager {
  constructor() {
    this._events = new EventEmitter();

    this._monitors = {};
    this._handlers = {};
    this._proxies = new Map();

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
   * Handler for registering a proxy for use
   * (NOTE: Prevents multiple re-registering)
   * @param {Object} proxy - proxy object
   */
  registerProxy(proxy) {
    let proxyId;
    const proxyHash = hash(proxy);

    for (const val of this._proxies.values()) {
      if (val.hash.includes(proxyHash)) {
        return;
      }
    }

    do {
      proxyId = shortid.generate();
    } while (this._proxies.get(proxyId));

    this._proxies.set(proxyId, {
      id: proxyId,
      hash: proxyHash,
      proxy,
      banList: {},
      useList: {},
    });
  }

  /**
   * Handler for mass registering proxies
   * @param {List<Object>} proxies - list of proxy objects
   */
  registerProxies(proxies) {
    proxies.forEach(p => this.registerProxy(p));
  }

  /**
   * Handler for deregistering a proxy for when they remove it
   * from the list of proxies on the frontend.
   * @param {Object} proxy - proxy object
   */
  deregisterProxy(proxy) {
    const proxyHash = hash(proxy);
    let storedProxy = null;
    for (const val of this._proxies.values()) {
      if (val.hash === proxyHash) {
        storedProxy = val;
        break;
      }
    }

    if (!storedProxy) {
      return;
    }
    this._proxies.delete(storedProxy.id);
  }

  /**
   * Hanlder for mass degistering proxies
   * @param {List<Object>} proxies - list of proxy objects
   */
  deregisterProxies(proxies) {
    proxies.forEach(p => this.deregisterProxy(p));
  }

  /**
   * Handler for assigning a new proxy to the monitor instance
   * @param {String} site - site (url) being monitored
   * @param {Boolean} wait - whether or not to wait for an open proxy
   * @param {Number} timeout - the timeout to recheck for an open proxy
   */
  assignProxy(site, wait = false, timeout = 5) {
    if (!timeout || Number.isNaN(timeout) || timeout < 0) {
      timeout = 0;
    }
    let proxy = null;

    for (const val of this._proxies.values()) {
      if (!val.useList[site] && !val.banList[site]) {
        proxy = val;
        break;
      }
    }
    if (proxy) {
      proxy.useList[site] = true;
      this._proxies.set(proxy.id, proxy);
      return proxy;
    }
    if (!wait || timeout === 0) {
      return null;
    }
    return new Promise(resolve => {
      setTimeout(() => resolve(this.assignProxy(site, wait, timeout - 1)), PROXY_RETRY_TIMEOUT);
      // TODO: do we need to clear the interval here?
    });
  }

  /**
   * Handler for freeing up a proxy in two cases:
   * 1. When a proxy is banned and swapped out
   * 2. When the monitor process closes and proxies need released during cleanup
   *
   * @param {String} id - incoming proxy id
   * @param {String} site - incoming monitor's site (url)
   * @param {Boolean} force - whether or not to force free the `banList` and `useList`
   */
  releaseProxy(id, site, force = false) {
    const proxy = this._proxies.get(id);
    if (!proxy) {
      return;
    }

    if (force) {
      delete proxy.banList[site];
      delete proxy.useList[site];
    } else {
      delete proxy.useList[site];
    }
  }

  /**
   * Handles timing out a proxy for `BANNED_PROXY_TIMEOUT`
   * @param {String} id - id of the incoming proxy
   * @param {String} site - site (url) of the incoming monitor
   */
  timeoutProxy(id, site) {
    const proxy = this._proxies.get(id);
    if (!proxy) {
      return;
    }

    // free up the useList, but wait 2 min. to lift the ban
    delete proxy.useList[site];
    proxy.banList[site] = true;
    setTimeout(() => {
      delete proxy.banList[site];
    }, BANNED_PROXY_TIMEOUT); // TODO: play around with this timeout more!
  }

  /**
   * Method to handle releasing/banning old proxy as well as
   * getting a new proxy to assign to the monitor
   * @param {String} id - proxy id being used
   * @param {String} site - site (url) being monitored
   * @param {Boolean} shouldBan - whether or not to ban
   */
  swapProxy(id, site, shouldBan = true) {
    let release = true;

    const oldProxy = this._proxies.get(id);
    if (!oldProxy) {
      release = false;
    }

    const newProxy = this.assignProxy(site);
    if (!newProxy) {
      return null;
    }

    if (release) {
      if (shouldBan) {
        this.timeoutProxy(id, site);
      }
      this.releaseProxy(id, site);
    }
    return newProxy;
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
    const newProxy = await this.swapProxy(proxyId, site, shouldBan);
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
    const openProxy = await this.assignProxy(site);
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
      this.releaseProxy(proxy.id, site, true);
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
    monitor._events.on(Monitor.Events.SwapProxy, this.handleSwapProxy, this);
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
    monitor.site = monitor.site.url;
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

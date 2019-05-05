const EventEmitter = require('eventemitter3');
const request = require('request-promise');
const { Events: ManagerEvents } = require('./utils/constants').Manager;
const { delay, rfrl } = require('./utils/constants').Utils;
const { States, Events: MonitorEvents, ErrorCodes } = require('./utils/constants').Monitor;
const { AtomParser, JsonParser, XmlParser } = require('./parsers');

class Monitor {
  get state() {
    return this._state;
  }

  get id() {
    return this._id;
  }

  get proxy() {
    return this._proxy;
  }

  constructor(id, data, proxy) {
    /**
     * @type {String} the id of the monitor process
     */
    this._id = id;

    /**
     * @type {Site} the shared site used by this monitor.
     */
    this._site = data.site;

    /**
     * Delays that should be used for this monitor object
     * // TODO: This will apply to all future monitorInfo objects that share this
     * // site even though they may have different delays -- see if we can add better
     * // support for adjusting the delays
     */
    this._errorDelay = data.errorDelay;
    this._monitorDelay = data.monitorDelay;

    /**
     * @type {List<String>} a list of ids for monitor data objects currently being monitored
     */
    this.monitorIds = [data.id];

    /**
     * Create a new event emitter to handle communication with the manager, even through
     * split contexts
     */
    this._events = new EventEmitter();

    /**
     * @type {List<MonitorInfo>} (see @structures/src/definitions/monitorInfo.js)
     */
    this._dataGroups = [data];
    this._proxy = proxy;

    this._request = request.defaults({
      timeout: 10000,
      jar: request.jar(),
    });

    this.stop = false;
    this._state = States.Start;

    this._events.on(ManagerEvents.Abort, this._handleAbort, this);
    this._events.on(ManagerEvents.AddMonitorData, this._handleAddMonitorData, this);
    this._events.on(ManagerEvents.RemoveMonitorData, this._handleRemoveMonitorData, this);
    this._events.on(ManagerEvents.UpdateMonitorData, this._handleUpdateMonitorData, this);
  }

  async swapProxies() {
    // emit the swap event
    this._events.emit(MonitorEvents.SwapProxy, this.id, this.proxy, this.shouldBanProxy);
    return new Promise((resolve, reject) => {
      let timeout;
      const proxyHandler = (id, proxy) => {
        clearTimeout(timeout);
        timeout = null;
        this.shouldBanProxy = 0;
        resolve(proxy);
      };
      timeout = setTimeout(() => {
        this._events.removeListener(MonitorEvents.ReceiveProxy, proxyHandler);
        if (timeout) {
          reject(new Error('Timeout'));
        }
      }, 10000); // TODO: Make this a variable delay?
      this._events.once(MonitorEvents.ReceiveProxy, proxyHandler);
    });
  }

  async _delay(status) {
    let timeout = this._monitorDelay;
    switch (status || 404) {
      case 401: {
        timeout = this._errorDelay;
        break;
      }
      default:
        break;
    }
    await delay(timeout);

    return { nextState: States.Parse };
  }

  async _handleParsingErrors(errors) {
    let delayStatus;
    let ban = true; // assume we have a softban
    let hardBan = false; // assume we don't have a hardban
    errors.forEach(({ status }) => {
      if (status === 403) {
        // ban is a strict hardban, so set the flag
        hardBan = true;
      } else if (status !== 429 && status !== 430) {
        // status is neither 403, 429, 430, so set ban to false
        ban = false;
      }
      if (!delayStatus && (status === ErrorCodes.VariantsNotAvailable || status >= 400)) {
        delayStatus = status; // find the first error that is either a product not found or 4xx response
      }
    });
    if (ban || hardBan) {
      // we can assume that it's a soft ban by default since it's either ban || hardBan
      const shouldBan = hardBan ? 2 : 1;
      return {
        shouldBan,
        nextState: States.SwapProxies,
      };
    }
    return this._delay(delayStatus || 404);
  }

  static _generateVariants(products) {
    // TODO: is there a better way to do this?
    return products.forEach(p => p.variants.filter(v => v.available));
  }

  _parseAll() {
    const parserData = {};
    parserData.keywords = this._dataGroups.map(({ keywords }) => ({ keywords }));
    parserData.site = this._site;

    // Create the parsers and start the async run methods
    const parsers = [
      new AtomParser(this._request, parserData, this._proxy),
      new JsonParser(this._request, parserData, this._proxy),
      new XmlParser(this._request, parserData, this._proxy),
    ].map(p => p.run());
    // Return the winner of the race
    return rfrl(parsers, 'parseAll');
  }

  async _monitorKeywords() {
    let products;
    try {
      // Try parsing all files and wait for the first response
      products = await this._parseAll();
    } catch (errors) {
      console.log(errors);
      return this._handleParsingErrors(errors);
    }

    console.log(`[DEBUG]: PRODUCTS: ${products}`);

    const variants = Monitor._generateVariants(products);
    console.log(`[DEBUG]: VARIANTS: ${variants}`);

    // TODO: Compare all products data with current exising record in DB
    /**
     * NEXT STATE
     *  -> If change, continue to send hooks && update db
     *  -> If no change, loop back to parse again
     */
  }

  async _handleParse() {
    const { nextState } = await this._monitorKeywords();
    console.log(`[DEBUG]: next state from handle parse: ${nextState}`);
    return nextState;
  }

  async _handleSwapProxy() {
    const {
      proxy: oldProxy,
      data: { errorDelay },
    } = this._context;

    try {
      const newProxy = await this.swapProxies();

      // Proxy is fine, update the references
      if (newProxy) {
        this.proxy = newProxy;
        oldProxy.proxy = newProxy.proxy;
        this.shouldBanProxy = 0; // reset ban flag
        return this._prevState;
      }
      await delay(errorDelay);
    } catch (err) {
      // TODO: handle proxy swapping errors
    }
    return this._prevState;
  }

  _handleAbort() {
    // TODO: Adjust logic to full implement stopping a monitor!
    this._aborted = true;
    return States.Stop;
  }

  _handleAddMonitorData(_, data) {
    const existingDataGroup = this._dataGroups.find(d => d.id === data.id);
    if (!existingDataGroup) {
      // Only add data group if it is new
      this._dataGroups.push(data);
    }
  }

  _handleRemoveMonitorData(_, data) {
    // Filter out the monitor infor from the tracked data groups
    this._dataGroups = this._dataGroups.filter(d => d.id !== data.id);
  }

  _handleUpdateMonitorData(_, data) {
    const index = this._dataGroups.findIndex(d => d.id === data.id);
    if (index === -1) {
      // data was not found, add it to the list
      this._dataGroups.push(data);
    } else {
      // Since products contains data generated and used by the monitor, we want to
      // keep this even though the other parts of the monitorInfo object may change.
      const { products } = this._dataGroups[index];
      data.products.forEach(p => {
        if (p.id !== products.id) {
          // Only push new products that haven't been tracked before
          products.push(p);
        }
      });
      // Update the reference with the new data
      this._dataGroups[index] = {
        ...data,
        products,
      };
    }
  }

  async _handleEndState() {
    return States.Stop;
  }

  async _handleState(state) {
    async function defaultHandler() {
      throw new Error('Reached Unknown State!');
    }

    const StateMap = {
      [States.Parse]: this._handleParse,
      [States.SwapProxies]: this._handleSwapProxy,
      [States.Abort]: this._handleAbort,
      [States.Error]: this._handleEndState,
      [States.Stop]: this._handleEndState,
    };

    const handler = StateMap[state] || defaultHandler;
    return handler.call(this);
  }

  async run() {
    let nextState = this._state;

    console.log('[DEBUG]: Handling state: %s', this._state);

    try {
      nextState = await this._handleState(this._state);
    } catch (error) {
      nextState = States.Error;
    }

    console.log('[DEBUG]: Transitioning to state: %s', nextState);

    if (this._state !== nextState) {
      this._prevState = this._state;
      this._state = nextState;
    }

    return false;
  }

  async start() {
    this._prevState = States.Parse;
    this._state = States.Parse;
    let stop = false;
    while (this._state !== States.Stop && !stop) {
      // eslint-disable-next-line no-await-in-loop
      stop = await this.run();
    }

    this._cleanup();
  }
}

Monitor.Events = MonitorEvents;
Monitor.States = States;

module.exports = Monitor;

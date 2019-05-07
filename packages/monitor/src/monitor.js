const EventEmitter = require('eventemitter3');
const request = require('request-promise');

const { Events: ManagerEvents } = require('./utils/constants').Manager;
const { delay, reflect } = require('./utils/constants').Utils;
const { States, Events: MonitorEvents, ErrorCodes } = require('./utils/constants').Monitor;
const { AtomParser, JsonParser, XmlParser, Parser } = require('./parsers');
const Product = require('./product');

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
      timeout: 20000,
      jar: request.jar(),
    });

    this._state = States.Start;

    this._events.on(ManagerEvents.Abort, this._handleAbort, this);
    this._events.on(ManagerEvents.AddMonitorData, this._handleAddMonitorData, this);
    this._events.on(ManagerEvents.RemoveMonitorData, this._handleRemoveMonitorData, this);
    this._events.on(ManagerEvents.UpdateMonitorData, this._handleUpdateMonitorData, this);
  }

  notifyProductUpdate(type, product, webhooks) {
    this._events.emit(MonitorEvents.NotifyProduct, product, type, webhooks);
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
    console.log(ban, hardBan);
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

  async _filter(products) {
    // filter out errors
    const _products = products.filter(p => p.status === 'resolved');

    // no parsing resolve correctly, let's retry..
    if (!_products.length) {
      return { nextState: States.Parse };
    }

    // filter out any similar results (based on the url?)
    const productMap = {};
    _products.forEach(result => {
      result.v.forEach(product => {
        product.matches.forEach(p => {
          if (p && p.url && !productMap[p.url]) {
            productMap[p.url] = { monitorInfoId: product.monitorInfoId, product: p };
          }
        });
      });
    });

    // get full product data for remaining results
    const inStockProducts = await Promise.all(
      Object.values(productMap).map(({ monitorInfoId, product: p }) =>
        (async () => {
          // TODO: handle request errors here?
          const product = await Parser.getFullProductInfo(p.url, this._request);
          return {
            monitorInfoId,
            product,
          };
        })(),
      ),
    );

    const productMapping = {};
    inStockProducts.forEach(prods => {
      const { monitorInfoId, product } = prods;
      if (productMapping[monitorInfoId]) {
        productMapping[monitorInfoId].push(product);
      } else {
        productMapping[monitorInfoId] = [product];
      }
    });

    return productMapping;
  }

  async _parseAll() {
    const parserData = {};
    parserData.keywords = this._dataGroups.map(({ id, keywords }) => ({
      ...keywords,
      monitorInfoId: id,
    }));
    parserData.site = this._site;

    // Create the parsers and start the async run methods
    const parsers = [
      new AtomParser(this._request, parserData, this._proxy),
      new JsonParser(this._request, parserData, this._proxy),
      new XmlParser(this._request, parserData, this._proxy),
    ].map(p => reflect(p.run()));
    // Return all the data from all the parsers
    return Promise.all(parsers);
  }

  async _monitorKeywords() {
    let products;
    try {
      // Try parsing all files and wait for all responses (either rejected or resolved)
      products = await this._parseAll();
    } catch (errors) {
      return this._handleParsingErrors(errors);
    }

    // if we received no response with no errors somehow, let's try again.
    if (!products.length) {
      return { nextState: States.Parse };
    }

    const productMapping = await this._filter(products);

    // send to manager at this point?
    if (productMapping) {
      Object.entries(productMapping).forEach(([monitorInfoId, val]) => {
        const monitorInfo = this._dataGroups.find(d => d.id === monitorInfoId);

        val.forEach(p => {
          const newProduct = new Product({
            ...p,
            id: '',
            site: this._site,
            monitorInfoId,
          });

          const oldProduct = monitorInfo.products.find(existing => existing.url === newProduct.url);

          if (oldProduct && newProduct.variants && newProduct.variants.length) {
            // push greater stock changes to the products list
            if (oldProduct.variants && oldProduct.variants.length < newProduct.variants.length) {
              this._events.emit(
                MonitorEvents.NotifyProduct,
                newProduct,
                'Release',
                monitorInfo.webhooks,
              );
              monitorInfo.products.push(newProduct);
            }
          } else {
            // it's a newly found product or out of stock event, post it immediately
            this._events.emit(
              MonitorEvents.NotifyProduct,
              newProduct,
              'Release',
              monitorInfo.webhooks,
            );
            monitorInfo.products.push(newProduct);
          }
        });
      });
    }

    await delay(this._monitorDelay);
    return { nextState: States.Parse };
  }

  async _handleParse() {
    const { nextState } = await this._monitorKeywords();
    return nextState;
  }

  async _handleSwapProxy() {
    try {
      const newProxy = await this.swapProxies();

      // Proxy is fine, update the references
      if (newProxy) {
        const { proxy } = newProxy;
        this._proxy = proxy;
        this.shouldBanProxy = 0; // reset ban flag
        return this._prevState;
      }
      await delay(this._errorDelay);
    } catch (err) {
      // TODO: handle proxy swapping errors
    }
    return this._prevState;
  }

  // eslint-disable-next-line class-methods-use-this
  _handleAbort() {
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

  async _handleState(state) {
    async function defaultHandler() {
      throw new Error('Reached Unknown State!');
    }

    const StateMap = {
      [States.Parse]: this._handleParse,
      [States.SwapProxies]: this._handleSwapProxy,
      [States.Abort]: this._handleAbort,
      [States.Error]: () => {
        return States.Stop;
      },
      [States.Stop]: () => {
        return States.Stop;
      },
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

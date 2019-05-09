const EventEmitter = require('eventemitter3');
const request = require('request-promise');
const { Events: ManagerEvents } = require('../utils/constants').Manager;
const AsyncQueue = require('../utils/asyncQueue');
const { delay, reflect, getCurrencyForSite } = require('../utils/constants').Utils;
const { States, Events: MonitorEvents } = require('../utils/constants').Monitor;
const { AtomParser, JsonParser, XmlParser, Parser } = require('../parsers');
const Product = require('../product');
const ProxyManager = require('../proxyManager');

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

  get workerQueue() {
    return this._workerQueue;
  }

  constructor(id, data, proxies) {
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
    this._proxyManager = new ProxyManager();

    /**
     * @type {List<MonitorInfo>} (see @structures/src/definitions/monitorInfo.js)
     */
    this._dataGroups = [data];

    /**
     * Proxy related variables
     */
    this._proxies = proxies;
    this._shouldBanProxy = 0;
    this._proxy = null;

    this._request = request.defaults({
      family: 4, // needed for worker_threads context to use proper `requests` node version
      timeout: 20000, // default the timeout 20s (this may be overrode in any request)
      jar: request.jar(), // default cookie jar to use for all requests
    });

    this._currency = getCurrencyForSite(data.site);
    this._fetchedProducts = {};
    this._productMapping = {};
    this._workerQueue = new AsyncQueue();

    this._state = States.Start;

    // TODO: handle proper abort
    // eslint-disable-next-line no-return-assign
    this._events.on(ManagerEvents.Abort, () => (this._state = States.Stop), this);
    this._events.on(ManagerEvents.AddMonitorData, this._handleAddMonitorData, this);
    this._events.on(ManagerEvents.RemoveMonitorData, this._handleRemoveMonitorData, this);
    this._events.on(ManagerEvents.UpdateMonitorData, this._handleUpdateMonitorData, this);
  }

  notifyProductUpdate(type, product, webhooks) {
    this._events.emit(MonitorEvents.NotifyProduct, product, type, webhooks);
  }

  async swapProxies() {
    const oldProxyId = this._proxy ? this._proxy.id : null;
    return new Promise(async (resolve, reject) => {
      let timeout = setTimeout(() => {
        if (timeout) {
          reject(new Error('Proxy Swapping Timed Out!'));
        }
      }, 10000);
      const newProxy = await this._proxyManager.swap(oldProxyId, this._site, this._shouldBanProxy);
      if (newProxy) {
        clearTimeout(timeout);
        timeout = null;
        this._shouldBanProxy = 0;
        resolve(newProxy);
      }
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
    return this._prevState;
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
      if (!delayStatus && status >= 400) {
        delayStatus = status; // find the first error that is either a product not found or 4xx response
      }
    });
    console.log(`[DEBUG]: Hard Banned?: %j Soft Banned?: %j`, hardBan, ban);
    if (ban || hardBan) {
      // we can assume that it's a soft ban by default since it's either ban || hardBan
      this._shouldBanProxy = hardBan ? 2 : 1;
      return States.SwapProxies;
    }
    return this._delay(delayStatus || 404);
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

  async _handleParse() {
    let products;
    try {
      // Try parsing all files and wait for all responses (either rejected or resolved)
      products = await this._parseAll();
    } catch (errors) {
      console.log(`[DEBUG]: parse all errors: %j`, errors);
      return this._handleParsingErrors(errors);
    }

    // filter out errors
    products = products.filter(p => p.status === 'resolved');
    console.log(`[DEBUG]: %d parser resolved`, products.length);

    // no parsing resolve correctly, let's exit early, wait, and retry..
    if (!products.length) {
      await delay(this._errorDelay);
      return States.Parse;
    }

    // filter out any similar results (based on the products url)
    const productMap = {};
    products.forEach(result => {
      result.v.forEach(product => {
        // Check to see if existing monitor data exists (just in case it was removed asynchronously)
        const { monitorInfoId } = product;
        const monitorInfo = this._dataGroups[monitorInfoId];
        if (!monitorInfo) {
          // Monitor data group was removed by the time we fetched this product, so we should not continue with the data
          return;
        }
        product.matches.forEach(p => {
          if (p && p.url && !productMap[p.url]) {
            // Set a flag in our productMap to prevent duplicate products from appearing
            productMap[p.url] = true;
            // check to see if the worker queue doesn't already contain that product waiting to be fetched
            if (!this._workerQueue.find(workerData => workerData.product.url === p.url)) {
              console.log(`[DEBUG]: Adding %s to worker queue context now...`, p.url);
              // TODO: Spawn a new worker context here instead of just pushing it to the queue
              // Check for previously tracked product so we can tell if we are updating or adding a new product
              const existingProduct = monitorInfo.products.find(existing => existing.url === p.url);
              const productToInsert = existingProduct || p;
              const type = existingProduct ? 'update' : 'add';
              // Insert product into the worker queue so we can fetch it asynchronously
              this._workerQueue.insert({
                monitorInfoId,
                product: productToInsert,
                type,
              });
            }
          }
        });
      });
    });

    console.log(`[DEBUG]: Waiting %d ms`, this._monitorDelay);
    await delay(this._monitorDelay);
    return States.Parse;
  }

  async _handleFilter() {
    // if we have fetched products...
    if (this._fetchedProducts) {
      // get full product data for remaining results
      const inStockProducts = await Promise.all(
        Object.values(this._fetchedProducts).map(({ monitorInfoId, product: p }) =>
          (async () => {
            // TODO: we need a way to swap proxies midway here? or something a bit nicer
            const product = await Parser.getFullProductInfo(p.url, this._currency, this._request);
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

      // update global products mapping
      this._productMapping = productMapping;
      return States.Process;
    }
    // otherwise, go back to previous step and try to find products
    return States.Parse;
  }

  async _handleProductComparison() {
    // if we have our product mapping...
    if (this._productMapping) {
      Object.entries(this._productMapping).forEach(([monitorInfoId, val]) => {
        const monitorInfo = this._dataGroups.find(d => d.id === monitorInfoId);

        val.forEach(p => {
          const newProduct = new Product({
            ...p,
            site: this._site,
            monitorInfoId,
          });

          const oldProduct = monitorInfo.products.find(existing => existing.url === newProduct.url);

          if (oldProduct && newProduct.variants && newProduct.variants.length) {
            console.log(
              `[DEBUG]: %d old variants, %d new variants`,
              oldProduct.variants.length,
              newProduct.variants.length,
            );
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

      // after processing, clear out the mapping, wait for our delay, and parse again
      this._productMapping = {};
      await delay(this._monitorDelay);
      return States.Parse;
    }
    // if we don't have our product mapping, go back to get it...
    return States.Filter;
  }

  async _handleSwapProxy() {
    try {
      const newProxy = await this.swapProxies();

      // Proxy is fine, update the references
      if (newProxy) {
        const { proxy } = newProxy;
        this._proxy = proxy;
        this._shouldBanProxy = 0; // reset ban flag
        return this._prevState;
      }
      await delay(this._errorDelay);
    } catch (err) {
      // TODO: handle proxy swapping errors
    }
    return this._prevState;
  }

  // MARK: Manager ~ Monitor Event Functions
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

  // MARK: State Machine Logic
  async _handleState(state) {
    async function defaultHandler() {
      throw new Error('Reached Unknown State!');
    }

    const StateMap = {
      [States.Parse]: this._handleParse,
      [States.Filter]: this._handleFilter,
      [States.Process]: this._handleProductComparison,
      [States.SwapProxies]: this._handleSwapProxy,
      [States.Abort]: () => States.Stop,
      [States.Error]: () => States.Stop,
      [States.Stop]: () => States.Stop,
    };

    const handler = StateMap[state] || defaultHandler;
    return handler.call(this);
  }

  async run() {
    let nextState = this._state;

    console.log('[DEBUG]: Handling state: %j', this._state);

    try {
      nextState = await this._handleState(this._state);
    } catch (error) {
      console.log(error);
      nextState = States.Error;
    }

    console.log('[DEBUG]: Transitioning to state: %j', nextState);

    if (this._state !== nextState) {
      this._prevState = this._state;
      this._state = nextState;
    }

    return false;
  }

  // MARK: Entry point for spawning new monitors
  async start() {
    this._prevState = States.Parse;
    this._state = States.Parse;

    this._proxy = await this._proxyManager.reserve(this._proxies);

    let stop = false;
    while (this._state !== States.Stop && !stop) {
      // eslint-disable-next-line no-await-in-loop
      stop = await this.run();
    }
  }
}

Monitor.Events = MonitorEvents;
Monitor.States = States;

module.exports = Monitor;

const EventEmitter = require('eventemitter3');
const request = require('request-promise');
const { delay, rfrl, ErrorCodes, format, userAgent } = require('./utils/constants').Utils;
const { States, Events, Delays, Hooks } = require('./utils/constants').Monitor;
const ManagerEvents = require('./utils/constants').Manager.Events;
const { ParseType, getParseType } = require('./utils/parse');
const { generateAvailableVariants } = require('./utils/generateVariants');
const { Parser, AtomParser, JsonParser, XmlParser, getSpecialParser } = require('./parsers');

const { Discord, Slack } = require('./hooks');
const Product = require('./product');

class Monitor {
  get state() {
    return this._state;
  }

  get data() {
    return this._data;
  }

  get id() {
    return this._id;
  }

  get proxy() {
    return this._proxy;
  }

  constructor(id, data, proxy) {
    this._id = id;
    this._data = data;
    this._proxy = proxy;

    this._request = request.defaults({
      timeout: 10000,
      jar: request.jar(),
    });

    this.stop = false;
    this._state = States.Start;

    this._context = {
      id,
      data,
      proxy: proxy ? proxy.proxy : null,
      status: null,
      request: this._request,
      discord: data.discord ? new Discord(data.discord) : null,
      slack: data.slack ? new Slack(data.slack) : null,
      abort: false,
    };

    this._parseType = getParseType(this._context.data.keywords, this._context.data.site);

    this._events = new EventEmitter();

    this._handleAbort = this._handleAbort.bind(this);
    this._events.on(ManagerEvents.ChangeDelay, this._changeDelay, this);
    this._events.on(ManagerEvents.ChangeWebhook, this._changeWebhook, this);
  }

  async swapProxies() {
    // emit the swap event
    this._events.emit(Events.SwapProxy, this.id, this.proxy, this.shouldBanProxy);
    return new Promise((resolve, reject) => {
      let timeout;
      const proxyHandler = (id, proxy) => {
        clearTimeout(timeout);
        timeout = null;
        this.shouldBanProxy = 0;
        resolve(proxy);
      };
      timeout = setTimeout(() => {
        this._events.removeListener(Events.ReceiveProxy, proxyHandler);
        if (timeout) {
          reject(new Error('Timeout'));
        }
      }, 10000); // TODO: Make this a variable delay?
      this._events.once(Events.ReceiveProxy, proxyHandler);
    });
  }

  // MARK: Event Registration
  registerForEvent(event, callback) {
    switch (event) {
      case Events.Status: {
        this._events.on(Events.Status, callback);
        break;
      }
      default:
        break;
    }
  }

  deregisterForEvent(event, callback) {
    switch (event) {
      case Events.Status: {
        this._events.removeListener(Events.Status, callback);
        break;
      }
      default: {
        break;
      }
    }
  }

  _emitEvent(event, payload = {}) {
    switch (event) {
      // Emit supported events on their specific channel
      case Events.Status: {
        if (payload.status && payload.status !== this._context.status) {
          this._context.status = payload.status;
          this._events.emit(event, this._context.id, payload, event);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  _handleAbort(id) {
    if (id !== this._context.id) {
      return;
    }
    this._context.abort = true;
  }

  _changeDelay(id, newDelay, type) {
    if (id !== this._context.id) {
      return;
    }

    if (type === Delays.Error) {
      this._context.data.errorDelay = newDelay;
    } else if (type === Delays.Monitor) {
      this._context.data.monitorDelay = newDelay;
    }
  }

  _changeWebhook(id, hook, type) {
    if (id !== this._context.id) {
      return;
    }

    if (type === Hooks.Discord) {
      this._context.data.discord = hook;
    } else if (type === Hooks.Slack) {
      this._context.data.slack = hook;
    }
  }

  _cleanup() {
    if (this.TODO) {
      console.log(new Error('IMPLEMENT _cleanup'));
    }
  }

  async _delay(status) {
    let timeout = this._context.data.monitorDelay;
    switch (status || 404) {
      case 401: {
        timeout = this._context.data.errorDelay;
        break;
      }
      default:
        break;
    }
    await delay(timeout);
    console.log('monitoring...');
    return { status: `Monitoring`, nextState: States.Parse };
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
        message: 'Swapping proxy',
        shouldBan,
        nextState: States.SwapProxies,
      };
    }
    return this._delay(delayStatus || 404);
  }

  static _generateVariants(product) {
    let variants;
    try {
      ({ variants } = generateAvailableVariants(product));
    } catch (err) {
      if (err.code === ErrorCodes.VariantsNotMatched) {
        return {
          status: 'Unable to match',
          nextState: States.Stop,
        };
      }
      if (err.code === ErrorCodes.VariantsNotAvailable) {
        return {
          status: 'Restock Mode',
          nextState: States.Stock,
        };
      }
      return {
        status: 'Monitor has errored out!',
        nextState: States.Error,
      };
    }
    return variants;
  }

  _parseAll() {
    // Create the parsers and start the async run methods
    const parsers = [
      new AtomParser(this.request, this.data, this.proxy, this._parseType),
      new JsonParser(this.request, this.data, this.proxy, this._parseType),
      new XmlParser(this.request, this.data, this.proxy, this._parseType),
    ].map(p => p.run());
    // Return the winner of the race
    return rfrl(parsers, 'parseAll');
  }

  async _monitorKeywords() {
    let parsed;
    try {
      // Try parsing all files and wait for the first response
      parsed = await this._parseAll();
    } catch (errors) {
      return this._handleParsingErrors(errors);
    }

    console.log(products);

    const { variants, nextState } = Monitor._generateVariants(products);
    // TODO: Compare all products data with current exising record in DB
    /**
     * NEXT STATE
     *  -> If change, continue to send hooks && update db
     *  -> If no change, loop back to parse again
     */
  }

  async _monitorUrl() {
    const [url] = this._context.data.product.url.split('?');
    try {
      await this._request({
        method: 'GET',
        uri: url,
        proxy: format(this._context.proxy),
        rejectUnauthorized: false,
        followAllRedirects: true,
        resolveWithFullResponse: true,
        simple: true,
        gzip: true,
        headers: {
          'User-Agent': userAgent,
        },
      });

      let fullProductInfo;
      try {
        // Try getting full product info
        fullProductInfo = await Parser.getFullProductInfo(url, this._request);
      } catch (errors) {
        return this._handleParsingErrors(errors);
      }

      this._context.data.product.restockUrl = url; // Store restock url in case all variants are out of stock
      const { variants, nextState, status } = Monitor._generateVariants(fullProductInfo);
      // check for next state (means we hit an error when generating variants)
      if (nextState) {
        return { nextState, status };
      }
      this._context.data.product.variants = variants;

      this._context.data.product.name = fullProductInfo.title;
      return {
        status: `Found product: ${this._context.task.product.name}`,
        nextState: States.CheckStock,
      };
    } catch (error) {
      return this._delay(error.statusCode);
    }
  }

  async _monitorSpecial() {
    const { task, proxy } = this._context;
    const { product, site } = task;
    // Get the correct special parser
    const ParserCreator = getSpecialParser(site);
    const parser = ParserCreator(this._request, task, proxy);

    let parsed;
    try {
      parsed = await parser.run();
    } catch (error) {
      // Check for a product not found error
      if (error.status === ErrorCodes.ProductNotFound) {
        return { status: 'Product Not Found!', nextState: States.Error };
      }
      return this._delay(error.status);
    }
    this._context.task.product.restockUrl = parsed.url; // Store restock url in case all variants are out of stock
    let variants;
    let sizes;
    let nextState;
    let status;
    if (product.variant) {
      variants = [product.variant];
    } else {
      ({ variants, nextState, status } = Monitor._generateVariants(parsed));
      // check for next state (means we hit an error when generating variants)
      if (nextState) {
        return { nextState, status };
      }
    }

    this._context.data.product.variants = variants;
    this._context.data.product.chosenSizes = sizes;
    this._context.data.product.name = parsed.title;
    return {
      status: `Found product: ${this._context.data.product.name}`,
      nextState: States.Parse,
    };
  }

  async _handleParse() {
    const { abort } = this._context;
    const { status } = this._context;

    if (abort) {
      return States.Abort;
    }

    let nextState;
    let newStatus;
    switch (this._parseType) {
      case ParseType.Url: {
        ({ nextState, status: newStatus } = await this._monitorUrl());
        break;
      }
      case ParseType.Keywords: {
        ({ nextState, status: newStatus } = await this._monitorKeywords());
        break;
      }
      case ParseType.Special: {
        ({ nextState, status: newStatus } = await this._monitorSpecial());
        break;
      }
      default: {
        return { status: 'Invalid Product Input', nextState: States.Error };
      }
    }
    if (nextState === States.Error) {
      newStatus = status;
    }
    return { nextState, status: newStatus };
  }

  async _handleStock() {
    if (this._context.abort) {
      return States.Abort;
    }
    // TODO: run checking for stock methods
  }

  async _handleNotify() {
    if (this._context.abort) {
      return States.Abort;
    }
    // TODO: send webhooks
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

      // If we get a null proxy back, there aren't any available..
      await delay(errorDelay);
      // If we have a hard ban, continue waiting for open proxy
      if (this.shouldBanProxy > 0) {
        this._emitEvent({
          status: `No open proxies! Delaying ${errorDelay}ms...`,
        });
      }
    } catch (err) {
      this._emitEvent({ status: 'Error swapping proxies!' });
    }
    // Go back to previous state
    return this._prevState;
  }

  async _handleEndState() {
    let status = 'stopped';
    switch (this._state) {
      case States.Abort:
        status = 'aborted';
        break;
      case States.Error:
        status = 'errored';
        break;
      case States.Stop:
        status = 'stopped';
        break;
      default:
        break;
    }
    return States.Stop;
  }

  async _handleState(state) {
    async function defaultHandler() {
      throw new Error('Reached Unknown State!');
    }

    const StateMap = {
      [States.Parse]: this._handleParse,
      [States.Stock]: this._handleStock,
      [States.Notify]: this._handleNotify,
      [States.SwapProxies]: this._handleSwapProxy,
      [States.Error]: this._handleEndState,
      [States.Stop]: this._handleEndState,
      [States.Abort]: this._handleEndState,
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
      this._prevState = this.state;
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

Monitor.Events = Events;
Monitor.States = States;

module.exports = Monitor;

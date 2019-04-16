const EventEmitter = require('eventemitter3');
const request = require('request-promise');
const { States, Events, Delays, Hooks } = require('./constants').Monitor;
const ManagerEvents = require('./constants').Manager.Events;

const { Discord, Slack } = require('./hooks');

class Monitor {
  get state() {
    return this._state;
  }

  constructor(id, data, proxy) {
    this._id = id;
    this._data = data;
    this._proxy = proxy;

    // TEMPORARY: remove when all functions are implemented!
    this.TODO = true;

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
      request: this._request,
      discord: data.discord ? new Discord(data.discord) : null,
      slack: data.slack ? new Slack(data.slack) : null,
      abort: false,
    };

    this._events = new EventEmitter();

    this._handleAbort = this._handleAbort.bind(this);
    this._events.on(ManagerEvents.ChangeDelay, this._changeDelay, this);
    this._events.on(ManagerEvents.ChangeWebhook, this._changeWebhook, this);
  }

  _handleAbort(id) {
    if (id !== this._context.id) {
      return;
    }
    this._context.abort = true;
  }

  _changeDelay(id, delay, type) {
    if (id !== this._context.id) {
      return;
    }

    if (type === Delays.Error) {
      this._context.data.errorDelay = delay;
    } else if (type === Delays.Monitor) {
      this._context.data.monitorDelay = delay;
    }
  }

  _changeWebhook(id, hook, type) {
    if (id !== this._context.id) {
      return;
    }

    if (type === Hooks.Discord) {
      this._context.task.discord = hook;
    } else if (type === Hooks.Slack) {
      this._context.task.slack = hook;
    }
  }

  _cleanup() {
    if (this.TODO) {
      console.log(new Error('IMPLEMENT _cleanup'));
    }
  }

  /**
   * Starts the monitor process
   */
  async start() {
    this._prevState = States.Start;
    this._state = States.Start;

    while (this._state !== States.Stop && !this.stop) {
      // eslint-disable-next-line no-await-in-loop
      this.stop = await this.run();
    }

    this._cleanup();
  }

  async _handleStart() {
    if (this.TODO) {
      console.log(new Error('IMPLEMENT _handleStart'));
    }
  }

  async _handleParse() {
    if (this.TODO) {
      console.log(new Error('IMPLEMENT _handleParse'));
    }
  }

  async _handleSwapProxy() {
    if (this.TODO) {
      console.log(new Error('IMPLEMENT _handleSwapProxy'));
    }
  }

  async _handleCheckStock() {
    if (this.TODO) {
      console.log(new Error('IMPLEMENT _handleCheckStock'));
    }
  }

  _handleEndState() {
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
    return () => {
      this._emitEvent({
        status: this._context.status || `Monitor has ${status}`,
        done: true,
      });
      return States.Stop;
    };
  }

  async _handleState(state) {
    async function defaultHandler() {
      throw new Error('Reached Unknown State!');
    }

    const StateMap = {
      [States.Start]: this._handleStart,
      [States.Parse]: this._handleParse,
      [States.CheckStock]: this._handleCheckStock,
      [States.Error]: this._handleEndState,
      [States.Stop]: this._handleEndState,
      [States.Abort]: this._handleEndState,
    };

    const handler = StateMap[state] || defaultHandler;
    return handler.call(this);
  }

  async run() {
    let nextState = this._state;
    if (this._context.abort) {
      nextState = States.Abort;
    }

    try {
      nextState = await this._handleState(this._state);
    } catch (error) {
      nextState = States.Error;
    }

    if (this._state !== nextState) {
      this._prevState = this._state;
      this._state = nextState;
    }

    return false;
  }

  _setup() {
    if (this.TODO) {
      console.log(new Error('IMPLEMENT _setup'));
    }
  }
}

Monitor.Events = Events;
Monitor.States = States;

module.exports = Monitor;

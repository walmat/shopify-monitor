/* eslint class-methods-use-this: ["error", { "exceptMethods": ["send"] }] */
/* eslint import/no-unresolved: ["error", { ignore: ["worker_threads"] }] */
const { parentPort } = require('worker_threads');

const MonitorContextTransformer = require('./indexBase');

class MonitorThreadTransformer extends MonitorContextTransformer {
  constructor(contextName = 'child') {
    super(contextName);
  }

  wireErrors(errorTransformer) {
    process.on('uncaughtException', errorTransformer.bind(this));
    process.on('unhandledRejection', errorTransformer.bind(this));
  }

  send(payload) {
    parentPort.postMessage(payload);
  }

  receive(handler) {
    parentPort.on('message', ({ target, event, args }) => handler.call(this, target, event, args));
  }
}

const transformer = new MonitorThreadTransformer();
transformer.start();

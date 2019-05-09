/* eslint class-methods-use-this: ["error", { "exceptMethods": ["send"] }] */
const MonitorContextTransformer = require('./indexBase');

class MonitorProcessTransformer extends MonitorContextTransformer {
  constructor(contextName = 'child') {
    super(contextName);
  }

  wireErrors(errorTransformer) {
    process.on('uncaughtException', errorTransformer.bind(this));
    process.on('unhandledRejection', errorTransformer.bind(this));
  }

  send(payload) {
    process.send(payload);
  }

  receive(handler) {
    process.on('message', ({ target, event, args }) => handler.call(this, target, event, args));
  }
}

const transformer = new MonitorProcessTransformer();
transformer.start();

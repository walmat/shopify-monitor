/* eslint import/no-unresolved: ["error", { ignore: ["worker_threads"] }] */
const path = require('path');
const { Worker } = require('worker_threads');

const SplitContextManager = require('./splitContextManager');

class ThreadContext {
  constructor(mId, data) {
    this.id = mId;
    this.monitorIds = [data.id];
    this.site = data.site;
    this._name = 'Child Thread';
    this._target = 'child';
    this._worker = new Worker(path.resolve(__dirname, '../runnerScripts/indexThread.js'));
  }

  get name() {
    return this._name;
  }

  get target() {
    return this._target;
  }

  send(payload) {
    this._worker.postMessage(payload);
  }

  on(channel, handler) {
    this._worker.on(channel, handler);
  }

  removeListener(channel, handler) {
    this._worker.removeListener(channel, handler);
  }

  kill() {
    this._worker.terminate();
  }
}

class SplitThreadManager extends SplitContextManager {
  constructor() {
    super(ThreadContext);
  }
}

module.exports = SplitThreadManager;

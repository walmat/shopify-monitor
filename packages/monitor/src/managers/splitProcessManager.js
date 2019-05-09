const childProcess = require('child_process');
const path = require('path');

const SplitContextManager = require('./splitContextManager');

class ProcessContext {
  constructor(mId, data) {
    this.id = mId;
    this.monitorIds = [data.id];
    this.site = data.site;
    this._name = 'Child Process';
    this._target = 'child';
    this._child = childProcess.fork(path.resolve(__dirname, '../runnerScripts/process.js'));

    this.isExitPayload = () => true;
  }

  get name() {
    return this._name;
  }

  get target() {
    return this._target;
  }

  send(payload) {
    this._child.send(payload);
  }

  on(channel, handler) {
    this._child.on(channel, handler);
  }

  removeListener(channel, handler) {
    this._child.removeListener(channel, handler);
  }

  kill() {
    this._child.kill();
  }
}

class SplitProcessManager extends SplitContextManager {
  constructor() {
    super(ProcessContext);
  }
}

module.exports = SplitProcessManager;

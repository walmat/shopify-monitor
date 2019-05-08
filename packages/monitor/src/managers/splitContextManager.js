const constants = require('../utils/constants');
const Manager = require('./manager');

const MonitorEvents = constants.Monitor.Events;
const ManagerEvents = constants.Manager.Events;

class SplitContextManager extends Manager {
  constructor(ContextCtor) {
    super();
    this._ContextCtor = ContextCtor;
  }

  /**
   * Stop a Monitor process
   *
   * perform the superclasses stop operation, but support additional
   * options specific to split context management:
   * - wait - if the wait option is passed AND the given data is the last
   *          monitor data object for the child context, this method will
   *          wait for the child context to exit before returning.
   */
  async stop(data, options = {}) {
    const mId = await super.stop(data, options);
    if (!mId) {
      return null;
    }

    if (options.wait) {
      const childContext = this._monitors[mId];
      if (childContext.monitorIds.length === 1) {
        // Monitor was aborted, so we should kill the process and wait for exit
        await new Promise(resolve => {
          let forceKill;
          forceKill = setTimeout(() => {
            forceKill = null;
            childContext.kill();
            resolve();
          }, 5000);
          childContext.on('exit', (payload, next = () => {}) => {
            if (childContext.isExitPayload(payload)) {
              if (forceKill) {
                clearTimeout(forceKill);
              }
              // Run next handler to continue chain (if applicable)
              next();

              // The child context did send an exit payload, so resolve
              resolve();
            }
            // Run next handler to continue chain (if applicable)
            next();
          });
        });
      }
    }
    return mId;
  }

  /**
   * Stop Multiple Monitors
   *
   * perform the superclass stopAll operation, but support additional
   * options specific to split context management.
   * - wait - if the wait option is passed AND the collection of data
   *          groups to stop contains all data groups of a child context,
   *          this method will wait for the child context to stop before
   *          returning.
   */
  async stopAll(dataGroups, options = {}) {
    await Promise.all(super.stopAll(dataGroups, options));
  }

  _setup(monitorContext) {
    const mId = monitorContext.id;
    const handlerGenerator = (event, sideEffects) => (id, ...params) => {
      if (id === mId || id === 'ALL') {
        const args = [mId, ...params];
        if (sideEffects) {
          sideEffects.apply(this, args);
        }
        monitorContext.send({
          target: monitorContext.target,
          event,
          args,
        });
      }
    };

    const handlers = {
      receiveHandler: ({ target, event, args }, next = () => {}) => {
        // only handle events that target the main target
        if (target !== 'main') {
          next();
        }
        const eventHandlerMap = {
          [MonitorEvents.SwapProxy]: this.handleProxySwap,
          [MonitorEvents.NotifyProduct]: this.handleNotifyProduct,
        };

        const handler = eventHandlerMap[event];
        if (handler) {
          handler.apply(this, args);
        }

        next();
      },
    };

    // Generate handlers for each event
    [ManagerEvents.Abort, ManagerEvents.AddMonitorData, ManagerEvents.RemoveMonitorData].forEach(
      event => {
        let handler;
        switch (event) {
          case ManagerEvents.AddMonitorData: {
            const sideEffects = (id, data) => {
              this._monitors[id].monitorIds.push(data.id);
            };
            handler = handlerGenerator(ManagerEvents.AddMonitorData, sideEffects);
            break;
          }
          case ManagerEvents.RemoveMonitorData: {
            const sideEffects = (id, data) => {
              this._monitors[id].monitorIds = this._monitors[id].monitorIds.filter(id !== data.id);
            };
            handler = handlerGenerator(ManagerEvents.RemoveMonitorData, sideEffects);
            break;
          }
          default: {
            handler = handlerGenerator(event, null);
            break;
          }
        }

        handlers[event] = handler;
        this._events.on(event, handler, this);
      },
    );
    // Store handlers for cleanup
    this._handlers[mId] = handlers;

    // Attach message handler to child context
    monitorContext.on('message', handlers.receiveHandler);
  }

  _cleanup(monitorContext) {
    const handlers = this._handlers[monitorContext.id];
    delete this._handlers[monitorContext.id];

    // Remove message handler
    monitorContext.removeListener('message', handlers.receiveHandler);
    delete handlers.receiveHandler;

    // Remove manager event handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      this._events.removeListener(event, handler);
    });
  }

  async _start([id, data, proxy]) {
    const monitorContext = this._ContextCtor(id, data, proxy);
    this._monitors[id] = monitorContext;

    this._setup(monitorContext);

    let doneHandler;
    try {
      monitorContext.send({
        target: monitorContext.target,
        event: '__start',
        args: [id, data, proxy],
      });
      await new Promise((resolve, reject) => {
        // create handler reference so we can clean it up later
        doneHandler = ({ target, event, args, error }, next = () => {}) => {
          // Only handle events targeted for the main process
          if (target !== 'main') {
            next();
          }

          // Reject or resolve based on end status
          switch (event) {
            case '__error': {
              reject(error);
              break;
            }
            case '__done': {
              resolve(args);
              break;
            }
            default: {
              break;
            }
          }

          // Call next handler for chaining (if applicable)
          next();
        };
        monitorContext.on('message', doneHandler);
      });
    } catch (error) {
      // TODO: handle error
      console.log(error);
    }

    // Perform child context cleanup
    monitorContext.removeListener('message', doneHandler);
    this._cleanup(monitorContext);

    monitorContext.kill();
  }
}

module.exports = SplitContextManager;

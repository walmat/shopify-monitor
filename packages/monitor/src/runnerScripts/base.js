/* eslint class-methods-use-this: ["error", { "exceptMethods": ["wireErrors", "send", "receive"] }] */
const constants = require('../utils/constants');
const Monitor = require('../monitors/monitor');

const ManagerEvents = constants.Manager.Events;
const MonitorEvents = constants.Monitor.Events;

/**
 * This class is the base for all split-context runners
 *
 * The goal of this script is to wire events from the parent
 * context to the child context by acting as a silent man-in-the-middle.
 *
 * This class is intended to be an abstact class that should NOT be instantiated.
 * Instead, subclasses should be created that implement the `send`, `receive` and
 * `wireErrors` methods. All functionality in this base class relies on these methods
 * to transform data between the parent and child context. By moving all functionality
 * here and only requiring the `send`, `receive` and `wireErrors` methods to be implemented
 * by subclasses, adding subclasses to transform different contexts is simple and easy.
 * Further, code duplication is minimized.
 */
class MonitorContextTransformer {
  constructor(contextName) {
    if (this.constructor === MonitorContextTransformer) {
      throw new TypeError('Cannot instantiate base class! Create a Subclass!');
    }
    this._contextName = contextName;
    this._started = false;

    // Wire errors using the given error transformer
    this.wireErrors(this._errorTransformer.bind(this));
  }

  /**
   * Wire Errors using a given error transformer
   *
   * If an error occurs outside of the monitor, catch it. The given
   * transformer will, by default, send the error to the main context so
   * it can respond accordingly.
   *
   * @param {Function} errorTransformer - function that accepts an error instance and sends it to the main context
   */
  wireErrors() {
    throw new Error('This method must be implemented!');
  }

  /**
   * Send data to the main context
   *
   * @param {Object} payload - the data to send to the main context
   */
  send() {
    throw new Error('This method must be implemented!');
  }

  /**
   * Receive payload from the main context
   *
   * This method should attach a handler that responds to data received from
   * the main context. The handler has several parameters:
   * - target - the target of this payload (should be the `contextName` given to the transformer)
   * - event - the event associated with this payload
   * - args - any additional arguments associated with the event
   * - next (Optional) - a reference to the next handler that should be called if the transformer requires chaining handlers
   *
   * @param {Function} handler - handler to call when payload has been received
   */
  receive() {
    throw new Error('This method must be implemented!');
  }

  /**
   * Start the context transformer
   *
   * Start listening for an initial 'start' message from the main
   * context. This will handle creating the Monitor, wiring
   * connections for events. Running the task, then cleaning up
   * the event handlers. Finally, a `__done` message will be sent
   * to the main context so it can dispose of the child context.
   */
  start() {
    this.receive(async (target, event, args, next) => {
      if (this._started || target !== this._contextName || event !== '__start') {
        // Runner should not be started, continue onto next handler (if applicable)
        if (next) {
          next();
        }
        return;
      }

      // start the runner
      this._started = true;
      await this._start(args);
      // notify main context we are done
      this.send({
        target: 'main',
        event: '__done',
      });
      // Reset the started flag so another job can be received
      this._started = false;
    });
  }

  /**
   * Wire events between main context and monitor
   *
   * Use the receive method to listen for events and send them
   * to the monitor.
   *
   * Use the send method to pass messages from the monitor to
   * the main context on certain monitor events.
   *
   * @param {Monitor} monitor - instance on which events will be attached
   */
  wireEvents(monitor) {
    this.receive((target, event, args, next) => {
      // Only respond to events meant for the child context
      if (target !== this._contextName) {
        return;
      }

      // Only handle certain events
      switch (event) {
        case ManagerEvents.AddMonitorData:
        case ManagerEvents.RemoveMonitorData:
        case ManagerEvents.Abort: {
          monitor._events.emit(event, ...args);
          break;
        }
        default: {
          break;
        }
      }

      if (next) {
        next();
      }
    });

    // Forward Monitor Events to the Main Process
    [MonitorEvents.NotifyProduct].forEach(event => {
      monitor._events.on(event, (...args) => {
        this.send({
          target: 'main',
          event,
          args,
        });
      });
    });
  }

  /**
   * Start the Monitor
   *
   * This is a convenience method to group all functions necessary
   * with starting/running a monitor. Transformers can just await this
   * method instead of having to copy the body of this method.
   *
   * @param {array} args - arguments needed to create a Monitor instance
   */
  async _start(args) {
    const monitor = new Monitor(...args);
    if (!monitor) {
      // Return early if we couldn't create the monitor
      return;
    }

    this.wireEvents(monitor);
    await monitor.start();
    monitor._events.removeAllListeners();
  }

  /**
   * Notify the main context that an error occurred
   *
   * @param {Error} error
   */
  _errorTransformer(error) {
    const { stack, message, filename, lineno } = error;
    this.send({
      target: 'main',
      event: '__error',
      error: { stack, message, filename, lineno },
    });
  }
}

module.exports = MonitorContextTransformer;

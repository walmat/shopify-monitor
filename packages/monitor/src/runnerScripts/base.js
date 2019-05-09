/* eslint class-methods-use-this: ["error", { "exceptMethods": ["wireErrors", "send", "receive", "start"] }] */

/**
 * This class is the base for all split-context runners
 *
 * The goal of this script is to wire events from the parent
 * context to the child context by acting as a silent man-in-the-middle.
 *
 * This class is intended to be an abstact class that should NOT be instantiated.
 * Instead, subclasses should be created that implement the `start`, `send`, `receive` and
 * `wireErrors` methods. All functionality in this base class relies on these methods
 * to transform data between the parent and child context. By moving all functionality
 * here and only requiring the `start`, `send`, `receive` and `wireErrors` methods to be implemented
 * by subclasses, adding subclasses to transform different contexts is simple and easy.
 * Further, code duplication is minimized.
 */
class ContextTransformer {
  constructor(contextName) {
    if (this.constructor === ContextTransformer) {
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
   * If an error occurs outside of code that runs, catch it. The given
   * transformer will, by default, send the error to the parent context so
   * it can respond accordingly.
   *
   * @param {Function} errorTransformer - function that accepts an error instance and sends it to the parent context
   */
  wireErrors() {
    throw new Error('This method must be implemented!');
  }

  /**
   * Send data to the parent context
   *
   * @param {Object} payload - the data to send to the parent context
   */
  send() {
    throw new Error('This method must be implemented!');
  }

  /**
   * Receive payload from the parent context
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
   * Start listening for an initial 'start' message from the parent
   * context. This will handle creating the Monitor, wiring
   * connections for events. Running the task, then cleaning up
   * the event handlers. Finally, a `__done` message will be sent
   * to the parent context so it can dispose of the child context.
   */
  start() {
    throw new Error('This method must be implemented!');
  }

  /**
   * Notify the parent context that an error occurred
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

module.exports = ContextTransformer;

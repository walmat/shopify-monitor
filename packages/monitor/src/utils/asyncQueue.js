/**
 * Async Queue
 *
 * A variant of a Queue with synchronous inserts and
 * asynchronous returns. If there is a backlog, the
 * returns are synchronous
 *
 * The queue also supports expiration of the backlog
 * by attaching a custom filter function to remove
 * expired items.
 */
class AsyncQueue {
  constructor() {
    this._backlog = [];
    this._waitQueue = [];
    this._expiration = {
      thisArg: null,
      filterFunc: null,
      interval: null,
      intervalId: null,
      onUpdate: null,
    };
  }

  get backlogLength() {
    return this._backlog.length;
  }

  get lineLength() {
    return this._waitQueue.length;
  }

  insert(datum) {
    // Check if we have anybody waiting for data
    if (this._waitQueue.length) {
      // Get the resolution and invoke it with the data
      const resolution = this._waitQueue.pop();
      resolution.request.status = 'fulfilled';
      resolution.request.value = datum;
      resolution.request.cancel = () => {};
      resolution.resolve(datum);
    } else {
      // Add data to the backlog
      this._backlog.unshift(datum);
      this._startExpirationInterval();
    }
    return this._backlog.length;
  }

  find(filterFunc) {
    // Search the backlog for the first instance that returns true from the provided filter function,

    if (!filterFunc) {
      // no filter func passed, so we can't find anything
      return null;
    }

    // Loop through in reverse, since the higher index items are the first items the get added to the backlog
    for (let i = this._backlog.length - 1; i >= 0; i -= 1) {
      const datum = this._backlog[i];
      if (filterFunc.call(null, datum)) {
        return datum;
      }
    }

    return null;
  }

  next() {
    // initialize request
    const nextRequest = {
      status: 'pending', // status of the request
      cancel: () => {}, // function to cancel the request with a given reason
      promise: null, // the async promise that is waiting for the next value
      reason: '', // the reason for cancelling the request
      value: null, // the resolved value
    };

    // Check if we don't have any waiters and we do have a backlog
    if (!this._waitQueue.length && this._backlog.length) {
      // return from the backlog immediately
      const value = this._backlog.pop();
      const promise = Promise.resolve(value);
      return {
        ...nextRequest,
        status: 'fulfilled',
        promise,
        value,
      };
    }

    // Setup request promise and cancel function
    nextRequest.promise = new Promise((resolve, reject) => {
      nextRequest.cancel = reason => {
        nextRequest.status = 'cancelled';
        nextRequest.reason = reason;
        this._waitQueue = this._waitQueue.filter(r => r.request !== nextRequest);
        reject(reason);
      };
      this._waitQueue.unshift({ resolve, reject, request: nextRequest });
    });

    return nextRequest;
  }

  clear() {
    // Remove all items from the backlog if they exist
    this._backlog = [];
    this._stopExpirationInterval();
  }

  destroy() {
    // Reject all resolutions in the wait queue
    this._waitQueue.forEach(({ reject, request }) => {
      request.status = 'destroyed';
      request.reason = 'Queue was destroyed';
      reject('Queue was destroyed');
    });
    this._waitQueue = [];

    // Remove all items from the backlog if they exist
    this.clear();
  }

  addExpirationFilter(filterFunc, interval = 1000, onUpdate, thisArg) {
    // Clear out previous interval if it exists
    if (this._expiration.intervalId) {
      clearInterval(this._expiration.intervalId);
    }
    // Update expiration settings
    this._expiration = {
      filterFunc,
      thisArg,
      interval,
      onUpdate,
      intervalId: null,
    };
    // Start interval if we have items in the backlog
    if (this.backlogLength > 0) {
      this._startExpirationInterval();
    }
  }

  _startExpirationInterval() {
    const { interval, intervalId, filterFunc: func } = this._expiration;
    // Prevent start if we already have a running interval
    // or if we don't have a defined filter function
    if (intervalId || !func) {
      return;
    }
    this._expiration.intervalId = setInterval(() => {
      const { filterFunc, thisArg, onUpdate } = this._expiration;
      this._backlog = this._backlog.filter(filterFunc, thisArg);
      if (this.backlogLength === 0) {
        this._stopExpirationInterval();
      }
      if (onUpdate) {
        onUpdate.call(thisArg);
      }
    }, interval);
  }

  _stopExpirationInterval() {
    const { intervalId } = this._expiration;
    // No need to stop twice
    if (!intervalId) {
      return;
    }
    clearInterval(intervalId);
    this._expiration.intervalId = null;
  }
}

module.exports = AsyncQueue;

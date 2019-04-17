// Split out into separate file for clarity
const { forEach } = require('underscore');

/**
 * Resolve the first Promise, Reject when all have failed
 *
 * This method accepts a list of promises and has them
 * compete in a horserace to determine which promise can
 * resolve first (similar to Promise.race). However, this
 * method differs why waiting to reject until ALL promises
 * have rejected, rather than waiting for the first.
 *
 * The return of this method is a promise that either resolves
 * to the first promises resolved value, or rejects with an arra
 * of errors (with indexes corresponding to the promises).
 *
 * @param {List<Promise>} promises list of promises to run
 * @param {String} tag optional tag to attach to log statements
 */
function resolveFirstRejectLast(promises) {
  return new Promise((resolve, reject) => {
    let errorCount = 0;
    const status = {
      winner: null,
      errors: new Array(promises.length),
    };
    forEach(promises, (p, idx) => {
      p.then(
        resolved => {
          if (!status.winner) {
            status.winner = resolved;
            resolve(resolved);
          }
        },
        error => {
          status.errors[idx] = error;
          errorCount += 1;
          if (errorCount >= status.errors.length && !status.winner) {
            reject(status.errors);
          }
        },
      );
    });
  });
}

module.exports = {
  rfrl: resolveFirstRejectLast,
};

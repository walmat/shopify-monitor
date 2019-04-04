const { promisify } = require('util');

// These arrays are exported here for testing purposes
// Arrays are subject to change as we include more redis functionality
export const methodsToAutoConvert = ['smembers', 'get', 'set', 'del', 'sadd', 'srem', 'exists'];
export const methodsToSpecialConvert = ['multi'];

export default function promisifyClient(client) {
  const updatedClient = client;
  if (!client) {
    return client;
  }
  methodsToAutoConvert.forEach(name => {
    updatedClient[`${name}Async`] = promisify(client[name]).bind(client);
  });
  // Special methods
  methodsToSpecialConvert.forEach(name => {
    switch (name) {
      case 'multi': {
        updatedClient.multiAsync = args => {
          return new Promise((resolve, reject) => {
            client.multi(args).exec((err, res) => {
              if (err) {
                reject(err);
              }
              resolve(res);
            });
          });
        };
        break;
      }
      default: {
        break;
      }
    }
  });
  updatedClient.__promisified = true;
  return updatedClient;
}

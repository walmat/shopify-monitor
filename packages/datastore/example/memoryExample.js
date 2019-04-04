const MemoryApi = require('../dist/api/memoryApi').default;

const api = new MemoryApi('test');

// Memory api is synchronous
try {
  const browsePayload = api.browse();
  console.log(browsePayload);
  const addPayload = api.add({ test: 'add1' });
  console.log(addPayload);
  const readPayload = api.read(addPayload.id);
  console.log(readPayload);
  const editPayload = api.edit(readPayload.id, { test: 'add2' });
  console.log(editPayload);
  const deletePayload = api.delete(editPayload.id);
  console.log(deletePayload);
} catch (err) {
  console.log(err);
}

// Memory api can also support promise style usage (first call needs be wrapped though)
// Promise.resolve(api.browse())
//   .then(payload => {
//     console.log(payload);
//     return api.add({ test: 'add1' });
//   })
//   .then(payload => {
//     console.log(payload);
//     return api.read(payload.id);
//   })
//   .then(payload => {
//     console.log(payload);
//     return api.edit(payload.id, { test: 'add2' });
//   })
//   .then(payload => {
//     console.log(payload);
//     return api.delete(payload.id);
//   })
//   .then(payload => {
//     console.log(payload);
//   })
//   .catch(err => {
//     console.log(err);
//   });

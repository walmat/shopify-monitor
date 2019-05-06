const { MemoryStore } = require('@monitor/datastore');
const monitor = require('./src');

const store = new MemoryStore();

// discord.build({
//   product: {
//     name: 'Air Jordan 312 Low in Pale Vanilla',
//     url: 'https://www.notre-shop.com/products/air-jordan-312-low-in-pale-vanilla',
//     image:
//       'https://images-ext-2.discordapp.net/external/Sqc7k0uScliCWVIzv2jt2IgHR6y5M64quVEIVkatM_Y/https/cdn.shopify.com/s/files/1/0624/0605/products/NOTRE-CHICAGO-JORDAN-AIR-JORDAN-LEGACY-312-LOW-VANILLA-UNI-GOLD-CD7069-200-3063.jpg?width=505&height=505',
//     price: '$140.00',
//   },
//   store: {
//     name: 'Notre Shop',
//     url: 'https://www.notre-shop.com',
//   },
//   stock: [{ name: '10.5', variant: '20521601728623' }, { name: '10.5', variant: '20521601728623' }],
//   type: 'Test',
// });

require('dotenv').config();

const Manager = new monitor.Manager(store);

const data = {
  id: 1,
  index: 1,
  site: {
    id: 1,
    name: 'Kith',
    url: 'https://www.kith.com',
  },
  keywords: {
    positive: ['yeezy'],
    negative: [],
    value: '+yeezy,+boucle',
  },
  status: '',
  monitorDelay: 1500,
  errorDelay: 1500,
  webhooks: [
    {
      id: '1',
      name: 'Test Customer',
      url:
        'https://discordapp.com/api/webhooks/573205927956578315/-HCPCPGWZZvdQHqckla9U_70APE4h0TWaXwf8LCOa0pYLvd1pd51mW7b43-EGMf7dubH',
    },
    // {
    //   id: 2,
    //   name: 'Flex Engines',
    //   url:
    //     'https://discordapp.com/api/webhooks/575047329174913027/SRqDuCC5UolVcI-e_hMo8Gyj7ZOj6wRcyxiik643joFVokHmi_m5yd-KCAwiIrzOKHz-',
    // },
  ],
};

Manager.start(data);

module.exports = {
  monitor,
};

const { MemoryStore } = require('@monitor/datastore');

const monitor = require('./src');
const Discord = require('./src/hooks/discord');

const store = new MemoryStore();

const discord = new Discord(
  'https://discordapp.com/api/webhooks/573205927956578315/-HCPCPGWZZvdQHqckla9U_70APE4h0TWaXwf8LCOa0pYLvd1pd51mW7b43-EGMf7dubH',
);

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
    name: '12AM Run',
    url: 'https://www.unknwn.com',
  },
  keywords: {
    positive: ['air', 'jordan', 'retro', '1', 'iv'],
    negative: [],
    value: '+yeezy,+boucle',
  },
  status: '',
  monitorDelay: 1500,
  errorDelay: 1500,
};

Manager.start(data);

module.exports = {
  monitor,
};

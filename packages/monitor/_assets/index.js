const { MemoryStore } = require('@monitor/datastore');
const monitor = require('../dist');

const Manager = new monitor.Manager(new MemoryStore());

const data = {
  index: 1,
  site: {
    name: 'Haven Shop',
    url: 'https://shop.havenshop.com',
  },
  keywords: {
    positive: ['Chuck', 'Egret', '70'],
    negative: [],
  },
  keywordsRaw: {
    value: '+yeezy,+boucle',
  },
  status: '',
  monitorDelay: 10000,
  errorDelay: 1500,
  products: [],
  webhooks: [
    {
      id: '1',
      name: 'Test Customer',
      url:
        'https://discordapp.com/api/webhooks/573205927956578315/-HCPCPGWZZvdQHqckla9U_70APE4h0TWaXwf8LCOa0pYLvd1pd51mW7b43-EGMf7dubH',
    },
  ],
};

Manager.start(data);

module.exports = {
  monitor,
};

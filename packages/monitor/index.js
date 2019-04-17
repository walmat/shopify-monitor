const monitor = require('./src');

const Manager = new monitor.Manager();

const data = {
  id: 1,
  index: 1,
  site: {
    id: 1,
    name: 'Kith',
    url: 'https://kith.com',
  },
  keywords: {
    positive: ['test'],
    negative: [],
    value: '+test',
  },
  status: '',
  monitorDelay: 1500,
  errorDelay: 1500,
};

Manager.start(data);

module.exports = {
  monitor,
};

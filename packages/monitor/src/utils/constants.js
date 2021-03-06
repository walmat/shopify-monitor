const { rfrl } = require('./rfrl');
const { reflect } = require('./reflect');
const { getCurrencyForSite } = require('./currency');

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const format = input => {
  // safeguard for if it's already formatted or in a format we can't handle
  if (!input) {
    return input;
  }

  if (input.startsWith('127') || input.indexOf('localhost') > -1) {
    return null;
  }

  const data = input.split(':');
  if (input.startsWith('http')) {
    if (data.length === 3) {
      return `${data[0]}:${data[1]}:${data[2]}`;
    }

    if (data.length === 5) {
      return `${data[0]}://${data[3]}:${data[4]}@${data[1].slice(2)}:${data[2]}`;
    }
  }

  if (data.length === 2) {
    return `http://${data[0]}:${data[1]}`;
  }
  if (data.length === 4) {
    return `http://${data[2]}:${data[3]}@${data[0]}:${data[1]}`;
  }
  return null;
};

const headers = ({ url }) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Connection: 'keep-alive',
  'User-Agent': userAgent,
  host: `${url.split('/')[2]}`,
});

const ManagerEvents = {
  Abort: 'ABORT',
  AddMonitorData: 'ADD_MONITOR_DATA',
  RemoveMonitorData: 'REMOVE_MONITOR_DATA',
  UpdateMonitorData: 'UPDATE_MONITOR_DATA',
};

const MonitorStates = {
  Start: 'START',
  Parse: 'PARSE',
  Filter: 'FILTER',
  Process: 'PROCESS',
  SwapProxies: 'SWAP_PROXIES',
  Error: 'ERROR',
  Stop: 'STOP',
};

const MonitorEvents = {
  SwapProxy: 'SWAP_PROXY',
  NotifyProduct: 'NOTIFY_PRODUCT',
};

const ErrorCodes = {
  ProductNotFound: 'PRODUCT_MISSING',
  ProductNotLive: 'PRODUCT_NOT_LIVE',
  VariantsNotAvailable: 'VARIANTS_NOT_AVAILABLE',
  VariantsNotMatched: 'VARIANTS_NOT_MATCHED',
  RestockingNotSupported: 'RESTOCK_NOT_SUPPORTED',
};

module.exports = {
  Manager: {
    Events: ManagerEvents,
  },
  Monitor: {
    States: MonitorStates,
    Events: MonitorEvents,
    ErrorCodes,
  },
  Utils: {
    userAgent,
    headers,
    delay,
    format,
    rfrl,
    reflect,
    getCurrencyForSite,
  },
};

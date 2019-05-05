const { rfrl } = require('./rfrl');

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36';

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
  SendProxy: 'SEND_PROXY',
  AddMonitorData: 'ADD_MONITOR_DATA',
  RemoveMonitorData: 'REMOVE_MONITOR_DATA',
  UpdateMonitorData: 'UPDATE_MONITOR_DATA',
};

const MonitorStates = {
  Start: 'START',
  Parse: 'PARSE',
  Compare: 'COMPARE',
  SwapProxies: 'SWAP_PROXIES',
  Stop: 'STOP',
};

const MonitorEvents = {
  All: 'ALL',
  Status: 'STATUS',
  SwapProxy: 'SWAP_PROXY',
  ReceiveProxy: 'RECEIVE_PROXY',
};

module.exports = {
  Manager: {
    Events: ManagerEvents,
  },
  Monitor: {
    States: MonitorStates,
    Events: MonitorEvents,
  },
  Utils: {
    userAgent,
    headers,
    delay,
    format,
    rfrl,
  },
};

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

const headers = ({ url, apiKey }) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Connection: 'keep-alive',
  'X-Shopify-Checkout-Version': '2019-10-06',
  'X-Shopify-Access-Token': `${apiKey}`,
  'x-barba': 'yes',
  'User-Agent': userAgent,
  host: `${url.split('/')[2]}`,
  authorization: `Basic ${Buffer.from(`${apiKey}::`).toString('base64')}`,
});

const ManagerEvents = {
  Abort: 'ABORT',
  SendProxy: 'SEND_PROXY',
  ChangeDelay: 'CHANGE_DELAY',
  ChangeWebhook: 'CHANGE_WEBHOOK',
};

const MonitorStates = {
  Start: 'START',
  Parse: 'PARSE',
  CheckStock: 'CHECK_STOCK',
  SwapProxies: 'SWAP_PROXIES',
  Error: 'ERROR',
  Abort: 'ABORT',
  Stop: 'STOP',
};

const MonitorEvents = {
  All: 'ALL',
  Status: 'STATUS',
  SwapProxy: 'SWAP_PROXY',
  ReceiveProxy: 'RECEIVE_PROXY',
};

const Delays = {
  Error: 'errorDelay',
  Monitor: 'monitorDelay',
};

const Hooks = {
  Discord: 'DISCORD',
  Slack: 'SLACK',
};

module.exports = {
  Manager: {
    Events: ManagerEvents,
  },
  Monitor: {
    States: MonitorStates,
    Events: MonitorEvents,
    Delays,
    Hooks,
  },
  Utils: {
    userAgent,
    headers,
    delay,
    format,
  },
};

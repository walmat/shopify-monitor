// Build a proxy object using an incoming string
import { parseURL } from 'whatwg-url';

import initialProxy from '../initialStates/proxy';

export default proxy => {
  if (!proxy) {
    // Return an initial proxy object is incoming string is null
    return { ...initialProxy };
  }
  // ensure parts of the proxy exist
  // NOTE: this regex ensures that all required parts exist, but _doesn't_ validate the parts themselves
  //       are valid. Further validation will be needed once we determine the required parts are present
  const proxyPartRegex = /(.+):([0-9]+)(?::(.+):(.+))?/;

  const match = proxyPartRegex.exec(proxy);
  if (!match) {
    throw new Error(
      `Invalid proxy format, ensure all required parts are present! Received: ${proxy}`,
    );
  }

  // The first index contains the full match, so shift it off before figuring out the number of
  // individual parts that were parsed (will be 2 or 4)
  // const fullMatch = match.shift();
  match.shift();

  // Determine if proxy requires auth
  let requiresAuth = false;
  if (match.length === 4) {
    requiresAuth = true;
  }

  // Validate parts of the proxy
  const [hostname, port, username, password] = match;

  // Validate hostname
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const parsedUrl = parseURL(hostname);
  if (!parsedUrl && !ipRegex.test(hostname)) {
    throw new Error(
      `Invalid hostname format, ensure hostname is a valid ip address or valid whatwg url! Received: ${hostname}`,
    );
  }

  // Validate port
  const portRegex = /^(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9][0-9]|6[0-4][0-9][0-9][0-9]|[0-5]?[0-9][0-9]?[0-9]?[0-9]?)$/;
  if (!portRegex.test(port)) {
    throw new Error(
      `Invalid port format, ensure port is within range (0-65535)! Received: ${port}`,
    );
  }

  // Reconstruct full value
  let value = `${hostname}:${port}`;
  if (requiresAuth) {
    value = `${value}:${username}:${password}`;
  }

  // Return built proxy object
  return {
    id: null,
    requiresAuth,
    username,
    password,
    hostname,
    port,
    value,
  };
};

/* eslint-disable no-restricted-syntax */
const hash = require('object-hash');
const shortid = require('shortid');

class ProxyManager {
  constructor() {
    this._proxies = new Map();
    this.timeout = 120000; // ms
    this.retry = 100; // ms
  }

  /**
   *
   * @param {Object} proxy - proxy object
   * {
   *  id: String,
   *  hash: String,
   *  proxy: String
   *  ban: <List/> of banned sites
   *  use: <List/> of used sites
   * }
   */
  register(proxy) {
    let id;
    const proxyHash = hash(proxy);

    // already registered
    for (const p of this._proxies.values()) {
      if (p.hash.includes(proxyHash)) {
        return;
      }
    }

    do {
      id = shortid.generate();
    } while (this._proxies.get(id));

    this._proxies.set(id, {
      id,
      hash: proxyHash,
      proxy,
      ban: {},
      use: {},
    });
  }

  /**
   * Deregisters a proxy from a monitor
   * @param {String} proxy - proxy {ip:port} (optional user:pass) format
   */
  deregister(proxy) {
    const proxyHash = hash(proxy);
    let stored = null;
    for (const p of this._proxies.values()) {
      if (p.hash === proxyHash) {
        stored = p;
        break;
      }
    }

    if (!stored) {
      return;
    }
    this._proxies.delete(stored.id);
  }

  reserve(site, wait = false, timeout = 5) {
    let newTimeout = timeout;
    if (!newTimeout || Number.isNaN(newTimeout) || newTimeout < 0) {
      newTimeout = 0;
    }
    let proxy = null;

    for (const p of this._proxies.values()) {
      if (!p.use[site] && (!p.ban[site] || p.ban[site] === 0)) {
        proxy = p;
        p.use[site] = true;
        this._proxies.set(proxy.id, proxy);
        return proxy;
      }
    }

    if (!wait || newTimeout === 0) {
      return null;
    }

    return new Promise(resolve =>
      setTimeout(() => resolve(this.reserve(site, wait, newTimeout - 1)), this.retry),
    );
  }

  ban(id, site, banFlag = 0) {
    const p = this._proxies.get(id);
    if (!p) return;

    delete p.use[site];
    p.ban[site] = banFlag;

    if (banFlag === 1) {
      setTimeout(() => {
        delete p.ban[site];
      }, this.timeout);
    }
    if (banFlag === 2) {
      this._proxies.delete(id);
    }
  }

  swap(id, site, banFlag = 0) {
    let release = true;

    const old = this._proxies.get(id);
    if (!old) release = false;

    const newProxy = this.reserve(site);
    if (!newProxy) return null;

    if (banFlag > 0) {
      this.ban(id, site, banFlag);
    }

    if (release) {
      this.release(id, site);
    }
    return newProxy;
  }

  release(id, site, force = false) {
    const p = this._proxies.get(id);
    if (!p) return;

    if (force) {
      delete p.ban[site];
    }
    delete p.use[site];
  }

  registerAll(proxies) {
    proxies.forEach(p => this.register(p));
  }

  deregisterAll(proxies) {
    proxies.forEach(p => this.deregister(p));
  }
}

module.exports = ProxyManager;

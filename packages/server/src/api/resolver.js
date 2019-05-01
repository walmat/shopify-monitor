import { MemoryStore } from '@monitor/datastore';
import { initialStates, utils } from '@monitor/structures';

const { monitorInfoState, proxyState, settingsState, siteState } = initialStates;
const { buildProxyInfo } = utils;

class Resolver {
  constructor() {
    this._settingsId = null;
    this.store = new MemoryStore();
  }

  async browseProxies() {
    return this.store.proxies.browse();
  }

  async readProxy(id) {
    return this.store.proxies.read(id);
  }

  async addProxyFromString(data) {
    const proxyData = buildProxyInfo(data.value);
    return this.store.proxies.add(proxyData);
  }

  async addProxyFromData(data) {
    // Supplement missing data with initial state until
    // partial proxy objects are supported
    const proxyData = {
      ...proxyState,
      ...data,
    };
    return this.store.proxies.add(proxyData);
  }

  async editProxyFromString(id, data) {
    const proxyData = buildProxyInfo(data.value);
    return this.store.proxies.edit(id, proxyData);
  }

  async editProxyFromData(id, data) {
    // Supplement missing data with initial state until
    // partial proxy objects are supported
    const proxyData = {
      ...proxyState,
      ...data,
    };
    return this.store.proxies.edit(id, proxyData);
  }

  async getSettings() {
    // Check if we can get the settings by id, or if we
    // need to deduce the settings id
    if (this._settingsId) {
      // get the settings and delete the id so graphql doesn't complain
      const settings = this.store.settings.read(this._settingsId);
      delete settings.id;
      return settings;
    }

    const settingsList = this.store.settings.browse();
    if (!settingsList.length) {
      // No settings stored, return default settings
      return { ...settingsState };
    }
    // Settings exist, get them, but remove the id value so graphql doesn't complain
    const settings = settingsList[0];
    this._settingsId = settings.id;
    delete settings.id;
    return settings;
  }

  async updateSettings(data) {
    // Supplement missing data with initial state until
    // partial settings objects are supported
    const settingsData = {
      ...settingsState,
      ...data,
    };

    // Check if we should update the settings or add new settings
    let settings;
    if (this._settingsId) {
      settingsData.id = this._settingsId;
      settings = await this.store.settings.edit(this._settingsId, settingsData);
    } else {
      settings = await this.store.settings.add(settingsData);
    }

    // store the id for future reference, then delete
    // the id from the return object so graphql doesn't complain,
    this._settingsId = settings.id;
    delete settings.id;
    return settings;
  }

  async browseWebhooks() {
    return this.store.sites.browse();
  }

  async readWebhook(id) {
    return this.store.sites.read(id);
  }

  async addWebhook(data) {
    // Supplement missing data with initial state until
    // partial site objects are supported
    const siteData = {
      ...siteState,
      ...data,
    };
    return this.store.sites.add(siteData);
  }

  async editWebhook(id, data) {
    // Supplement missing data with initial state until
    // partial site objects are supported
    const siteData = {
      ...siteState,
      ...data,
    };
    return this.store.sites.edit(id, siteData);
  }

  async browseMonitors() {
    return this.store.monitorInfoGroups.browse();
  }

  async readMonitor(id) {
    return this.store.monitorInfoGroups.read(id);
  }

  async addMonitor(data) {
    // Supplement missing data with initial state until
    // partial monitor objects are supported
    const monitorData = {
      ...monitorInfoState,
      ...data,
    };
    return this.store.monitorInfoGroups.add(monitorData);
  }

  async editMonitor(id, data) {
    // Supplement missing data with initial state until
    // partial monitor objects are supported
    const monitorData = {
      ...monitorInfoState,
      ...data,
    };
    return this.store.monitorInfoGroups.edit(id, monitorData);
  }
}

export default Resolver;

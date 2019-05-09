import uuidv4 from 'uuid/v4';

import { MemoryStore, RedisStore, Datasources } from '@monitor/datastore';
import { Manager, SplitProcessManager, SplitThreadManager } from '@monitor/monitor';
import { initialStates, utils } from '@monitor/structures';

const {
  monitorInfoState,
  productState,
  proxyState,
  settingsState,
  siteState,
  webhookGroupState,
} = initialStates;
const { buildProxyInfo } = utils;

class Resolver {
  constructor() {
    this._settingsId = null;
    if (process.env.MONITOR_DATASOURCE === Datasources.redis) {
      let connectArgs = [];
      // heroku defined .env variable
      if (process.env.REDIS_URL) {
        connectArgs = [process.env.REDIS_URL];
      } else {
        connectArgs = [
          {
            host: process.env.MONITOR_REDIS_HOST || '127.0.0.1',
            port: process.env.MONITOR_REDIS_PORT || '6379',
          },
        ];
      }
      this.store = new RedisStore(...connectArgs);
    } else {
      this.store = new MemoryStore();
    }

    switch (process.env.MONITOR_MANAGER_TYPE) {
      case 'process': {
        this._manager = new SplitProcessManager(this.store);
        break;
      }
      case 'thread': {
        this._manager = new SplitThreadManager(this.store);
        break;
      }
      default: {
        this._manager = new Manager(this.store);
      }
    }
  }

  async browseProducts() {
    return this.store.products.browse();
  }

  async readProduct(id) {
    return this.store.products.read(id);
  }

  async addProduct(data) {
    // Supplement missing data with initial state until
    // partial product objects are supported
    const productData = {
      ...productState,
      ...data,
    };
    return this.store.products.add(productData);
  }

  async editProduct(id, data) {
    // Supplement missing data with initial state until
    // partial product objects are supported
    const productData = {
      ...productState,
      ...data,
    };
    return this.store.products.edit(id, productData);
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
      const settings = await this.store.settings.read(this._settingsId);
      delete settings.id;
      return settings;
    }

    const settingsList = await this.store.settings.browse();
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

  async browseWebhookGroups() {
    return this.store.webhooks.browse();
  }

  async readWebhookGroup(id) {
    return this.store.webhooks.read(id);
  }

  async addWebhookGroup(data) {
    // Supplement missing data with initial state until
    // partial webhook group objects are supported
    const groupData = {
      ...webhookGroupState,
      ...data,
    };
    return this.store.webhooks.add(groupData);
  }

  async editWebhookGroup(id, data) {
    // Supplement missing data with initial state until
    // partial webhook group objects are supported
    const groupData = {
      ...webhookGroupState,
      ...data,
    };
    return this.store.webhooks.edit(id, groupData);
  }

  async browseWebhooks() {
    const webhookGroups = await this.browseWebhookGroups();
    const webhookMap = {};
    webhookGroups.forEach(group => {
      group.webhooks.forEach(w => {
        // Add webhook if it hasn't already been added.
        if (!webhookMap[w.id]) {
          webhookMap[w.id] = w;
        }
      });
    });
    return Object.values(webhookMap);
  }

  async readWebhook(id, groupId, groupName) {
    if (groupId) {
      // Attempt to get the single group instead of all groups
      // If webhook is not found, fallback to looking through all groups
      const group = await this.readWebhookGroup(id);
      const webhook = group.webhooks.find(w => w.id === id);
      if (webhook) {
        return webhook;
      }
    }
    let groups = await this.browseWebhookGroups();
    if (groupName) {
      // Attempt to filter out groups based on group name
      // Fallback to full list if there are no groups with the matching name
      const filtered = groups.filter(g => g.name === groupName);
      if (filtered.length) {
        groups = filtered;
      }
    }
    const webhookMap = {};
    groups.forEach(group => {
      group.webhooks.forEach(w => {
        // Add webhook if it hasn't already been added.
        if (!webhookMap[w.id]) {
          webhookMap[w.id] = w;
        }
      });
    });
    return webhookMap[id];
  }

  async addWebhook(data, groupId) {
    // Supplement missing data with initial state until
    // partial site objects are supported
    const siteData = {
      ...siteState,
      ...data,
    };
    try {
      const group = await this.readWebhookGroup(groupId);
      const existingIdx = group.webhooks.findIndex(w => w.url === siteData.url);
      if (existingIdx === -1) {
        group.webhooks.push({
          ...siteData,
          id: uuidv4(),
        });
        return this.editWebhookGroup(groupId, group);
      }
      const oldWebhook = group.webhooks[existingIdx];
      group.webhooks[existingIdx] = {
        ...oldWebhook,
        ...data,
      };
      return this.editWebhookGroup(groupId, group);
    } catch (_) {
      throw new Error('Invalid group id!');
    }
  }

  async editWebhook(id, data, groupId) {
    try {
      const group = await this.readWebhookGroup(groupId);
      const existingIdx = group.webhooks.findIndex(w => w.id === id);
      if (existingIdx === -1) {
        // no existing webhook, add it instead
        return this.addWebhook(data, groupId);
      }
      const oldWebhook = group.webhooks[existingIdx];
      group.webhooks[existingIdx] = {
        ...oldWebhook,
        ...data,
      };
      return this.editWebhookGroup(groupId, group);
    } catch (_) {
      throw new Error('Invalid group id!');
    }
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

  async startMonitor(id) {
    const monitorInfo = await this.store.monitorInfoGroups.read(id);
    this._manager.start(monitorInfo);

    return true;
  }

  async stopMonitor(id) {
    const monitorInfo = await this.store.monitorInfoGroups.read(id);
    this._manager.stop(monitorInfo);

    return true;
  }
}

export default Resolver;

import MemoryApi from '../api/memoryApi';
import Datasources from '../utils/datasources';

import Store from './store';

class MemoryStore extends Store {
  constructor() {
    super(Datasources.memory);
    this._monitorInfoApi = new MemoryApi('monitorInfos');
    this._productsApi = new MemoryApi('products');
    this._proxiesApi = new MemoryApi('proxies');
    this._settingsApi = new MemoryApi('settings');
    this._webhooksApi = new MemoryApi('webhooks');
  }

  get monitorInfoGroups() {
    return this._monitorInfoApi;
  }

  get products() {
    return this._productsApi;
  }

  get proxies() {
    return this._proxiesApi;
  }

  get settings() {
    return this._settingsApi;
  }

  get webhooks() {
    return this._webhooksApi;
  }
}

export default MemoryStore;

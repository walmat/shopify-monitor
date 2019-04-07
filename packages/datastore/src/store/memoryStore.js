import MemoryApi from '../api/memoryApi';
import Datasources from '../utils/datasources';

import Store from './store';

class MemoryStore extends Store {
  constructor() {
    super(Datasources.memory);
    this._monitorInfoApi = new MemoryApi('monitorInfos');
    this._proxiesApi = new MemoryApi('proxies');
    this._settingsApi = new MemoryApi('settings');
    this._sitesApi = new MemoryApi('sites');
  }

  get monitorInfoGroups() {
    return this._monitorInfoApi;
  }

  get proxies() {
    return this._proxiesApi;
  }

  get settings() {
    return this._settingsApi;
  }

  get sites() {
    return this._sitesApi;
  }
}

export default MemoryStore;

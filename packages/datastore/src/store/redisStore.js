import { createClient } from 'redis';

import RedisApi from '../api/redisApi';
import Datasources from '../utils/datasources';

import Store from './store';

class RedisStore extends Store {
  constructor(redisClientOptions = {}) {
    super(Datasources.redis);
    this._client = createClient(redisClientOptions);
    this._monitorInfoApi = new RedisApi('monitorInfos', this._client);
    this._productsApi = new RedisApi('products', this._client);
    this._proxiesApi = new RedisApi('proxies', this._client);
    this._settingsApi = new RedisApi('settings', this._client);
    this._webhooksApi = new RedisApi('webhooks', this._client);
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

export default RedisStore;

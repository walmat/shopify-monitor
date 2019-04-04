import uuidv4 from 'uuid/v4';

import Api from './api';
import promisifyClient from './utils/promisifyRedisClient';

class RedisApi extends Api {
  constructor(type, client) {
    super(type);
    // Setup client if it hasn't been setup already
    if (!client.___promisified) {
      this._client = promisifyClient(client);
    } else {
      this._client = client;
    }
  }

  async browse() {
    // get ids for the key
    try {
      const ids = await this._client.smembersAsync(`ids:${this._type}`);
      if (ids.length === 0) {
        return [];
      }
      const gets = ids.map(id => ['get', `data:${this._type}:${id}`]);
      const payloads = await this._client.multiAsync(gets);
      if (payloads.find(p => p === null) === null) {
        throw new Error('could not get all keys');
      }
      return payloads.map(JSON.parse);
    } catch (err) {
      throw new Error(`Unable to browse: ${err.message}`);
    }
  }

  async read(id) {
    try {
      const payload = await this._client.getAsync(`data:${this._type}:${id}`);
      if (!payload) {
        throw new Error('no data exists for id');
      }
      return JSON.parse(payload);
    } catch (err) {
      throw new Error(`Unable to retrieve: ${err.message}`);
    }
  }

  async edit(id, payload) {
    try {
      // Check for existing value
      const old = await this._client.getAsync(`data:${this._type}:${id}`);
      if (!old) {
        // No payload at the id -- add payload as a new one
        return this.add(payload);
      }
      const payloadStr = JSON.stringify({ ...payload, id });
      const reply = await this._client.setAsync(`data:${this._type}:${id}`, payloadStr);
      if (!reply) {
        throw new Error('updating payload failed');
      }
      // Setup cloned payload
      const clone = JSON.parse(payloadStr);
      clone.id = id;
      return clone;
    } catch (err) {
      throw new Error(`Unable to edit: ${err.message}`);
    }
  }

  async add(payload) {
    let newId = uuidv4();
    let verified = false;
    try {
      while (!verified) {
        // eslint-disable-next-line no-await-in-loop
        const reply = await this._client.existsAsync(`data:${this._type}:${newId}`);
        if (!reply) {
          verified = true;
        } else {
          newId = uuidv4();
        }
      }
      const clone = JSON.parse(JSON.stringify(payload));
      clone.id = newId;
      await this._client.multiAsync([
        ['sadd', `ids:${this._type}`, newId],
        ['set', `data:${this._type}:${newId}`, JSON.stringify(clone)],
      ]);
      return clone;
    } catch (err) {
      throw new Error(`Unable to add: ${err.message}`);
    }
  }

  async delete(id) {
    try {
      const reply = await this._client.getAsync(`data:${this._type}:${id}`);
      if (!reply) {
        // id doesn't exist, return nothing
        return null;
      }
      await this._client.multiAsync([
        ['srem', `ids:${this._type}`, id],
        ['del', `data:${this._type}:${id}`],
      ]);
      return JSON.parse(reply);
    } catch (err) {
      throw new Error(`Unable to delete: ${err.message}`);
    }
  }
}

export default RedisApi;

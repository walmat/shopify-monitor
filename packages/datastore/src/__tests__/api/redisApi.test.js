// Mock uuid and promisify
jest.mock('uuid/v4', () => jest.fn().mockImplementation(() => jest.requireActual('uuid/v4')()));
jest.mock('../../utils/promisifyRedisClient.js', () => {
  const { methodsToAutoConvert } = jest.requireActual('../../utils/promisifyRedisClient');
  const mock = jest.fn().mockImplementation(c => {
    const updatedC = c;
    updatedC.__promisified = true;
    return updatedC;
  });
  mock.methodsToAutoConvert = methodsToAutoConvert;
  return mock;
});

import uuidv4 from 'uuid/v4';
import RedisApi from '../../api/redisApi';
import promisifyRedisClient, { methodsToAutoConvert } from '../../utils/promisifyRedisClient';

describe('RedisApi', () => {
  let client;
  let api;

  beforeEach(() => {
    promisifyRedisClient.mockClear();
    client = {};
    methodsToAutoConvert.forEach(name => {
      client[`${name}Async`] = jest.fn();
    });
    client.multiExecAsync = jest.fn();
    client.__promisified = true;
  });

  afterEach(() => {
    client = null;
    api = null;
  });

  const validateIdInput = method => {
    it('should throw an error if id is null/undefined', async () => {
      await expect(api[method]()).rejects.toThrow('no id given');
      await expect(api[method](null)).rejects.toThrow('no id given');
    });

    it('should throw an error if id is not a string', async () => {
      await expect(api[method]({ test: true })).rejects.toThrow('invalid id format');
      await expect(api[method]([])).rejects.toThrow('invalid id format');
      await expect(api[method](2)).rejects.toThrow('invalid id format');
      await expect(api[method](true)).rejects.toThrow('invalid id format');
      await expect(api[method](() => {})).rejects.toThrow('invalid id format');
    });
  };

  const validatePayloadInput = (method, isFirst) => {
    it('should throw an error if payload is null/undefind', async () => {
      await expect(
        api[method].apply(api, [isFirst ? undefined : 'validid', undefined]),
      ).rejects.toThrow('no data given');
      await expect(api[method].apply(api, [isFirst ? null : 'validid', null])).rejects.toThrow(
        'no data given',
      );
    });

    it('should throw an error if payload is not an object', async () => {
      await expect(api[method].apply(api, ['not an object', 'not an object'])).rejects.toThrow(
        'invalid data format',
      );
      await expect(api[method].apply(api, [isFirst ? 2 : 'validid', 2])).rejects.toThrow(
        'invalid data format',
      );
      await expect(api[method].apply(api, [isFirst ? true : 'validid', true])).rejects.toThrow(
        'invalid data format',
      );
      await expect(
        api[method].apply(api, [isFirst ? () => {} : 'validid', () => {}]),
      ).rejects.toThrow('invalid data format');
    });
  };

  it('should construct properly', () => {
    expect(() => {
      api = new RedisApi('test', client);
    }).not.toThrow();
    expect(api).toBeDefined();
    expect(promisifyRedisClient).not.toHaveBeenCalled();
  });

  it('should perform promisification if not already done', () => {
    delete client.__promisified;
    api = new RedisApi('test', client);
    expect(api).toBeDefined();
    expect(promisifyRedisClient).toHaveBeenCalled();
  });

  it('should return the correct type', () => {
    api = new RedisApi('test', client);
    expect(api.type).toBe('test');
    api = new RedisApi('test2', client);
    expect(api.type).toBe('test2');
  });

  describe('browse', () => {
    beforeEach(() => {
      api = new RedisApi('test', client);
    });

    it('should return an empty array if not items are present', async () => {
      client.smembersAsync.mockResolvedValue([]);
      const items = await api.browse();
      expect(items).toHaveLength(0);
      expect(client.smembersAsync).toHaveBeenCalledWith('ids:test');
      expect(client.multiExecAsync).not.toHaveBeenCalled();
    });

    it('should return array of parsed data if items are present', async () => {
      const mockIds = ['test1', 'test2'];
      const mockItems = mockIds.map(id => JSON.stringify({ id }));
      client.smembersAsync.mockResolvedValue(['test1', 'test2']);
      client.multiExecAsync.mockResolvedValue(mockItems);
      const items = await api.browse();
      expect(items).toEqual([{ id: 'test1' }, { id: 'test2' }]);
      expect(client.smembersAsync).toHaveBeenCalledWith('ids:test');
      expect(client.multiExecAsync).toHaveBeenCalledWith([
        ['get', 'data:test:test1'],
        ['get', 'data:test:test2'],
      ]);
    });

    it('should throw an error when unable to get all keys', async () => {
      client.smembersAsync.mockRejectedValue(new Error('test'));
      await expect(api.browse()).rejects.toThrow('Unable to browse: test');
      expect(client.multiExecAsync).not.toHaveBeenCalled();
    });

    it('should throw an error when failing to retrive any data', async () => {
      client.smembersAsync.mockResolvedValue(['test1', 'test2']);
      client.multiExecAsync.mockRejectedValue(new Error('failed multi'));
      await expect(api.browse()).rejects.toThrow('Unable to browse: failed multi');
    });

    it('should throw an error when unable to retrive all data', async () => {
      const mockIds = ['test1', 'test2'];
      const mockItems = [JSON.stringify({ id: 'test1' }), null];
      client.smembersAsync.mockResolvedValue(mockIds);
      client.multiExecAsync.mockResolvedValue(mockItems);
      await expect(api.browse()).rejects.toThrow('Unable to browse: could not get all ids');
    });

    it('should throw an error when data is malformed', async () => {
      const mockIds = ['test1', 'test2'];
      const mockItems = ['not an object', 2];
      client.smembersAsync.mockResolvedValue(mockIds);
      client.multiExecAsync.mockResolvedValue(mockItems);
      await expect(api.browse()).rejects.toThrow('Unable to browse');
    });
  });

  describe('read', () => {
    beforeEach(() => {
      api = new RedisApi('test', client);
    });

    validateIdInput('read');

    it('should succeed when valid id is passed', async () => {
      client.getAsync.mockResolvedValue(JSON.stringify({ id: 'test1' }));
      const data = await api.read('test1');
      expect(data).toEqual({ id: 'test1' });
      expect(client.getAsync).toHaveBeenCalledWith('data:test:test1');
    });

    it('should throw an error when id is invalid', async () => {
      client.getAsync.mockResolvedValue(null);
      await expect(api.read('test1')).rejects.toThrow('Unable to read: no data exists for id');
    });

    it('should throw an error when unable to get data', async () => {
      client.getAsync.mockRejectedValue(new Error('test'));
      await expect(api.read('test1')).rejects.toThrow('Unable to read: test');
    });

    it('should throw an error when data is malformed', async () => {
      client.getAsync.mockResolvedValue('not an object');
      await expect(api.read('test1')).rejects.toThrow('Unable to read');
    });
  });

  describe('edit', () => {
    beforeEach(() => {
      api = new RedisApi('test', client);
    });

    validateIdInput('edit');
    validatePayloadInput('edit', false);

    it('should overwrite data if it exists', async () => {
      client.getAsync.mockResolvedValue(JSON.stringify({ old: true }));
      client.setAsync.mockResolvedValue('OK');
      const updated = await api.edit('test', { new: true });
      expect(updated).toEqual({ id: 'test', new: true });
      expect(client.getAsync).toHaveBeenCalledWith('data:test:test');
      expect(client.setAsync).toHaveBeenCalledWith(
        'data:test:test',
        expect.stringMatching('"new":true'),
      );
    });

    it('should update id on payload if id property exists', async () => {
      client.getAsync.mockResolvedValue(JSON.stringify({ old: true }));
      client.setAsync.mockResolvedValue('OK');
      const updated = await api.edit('test', { new: true, id: 'test2' });
      expect(client.getAsync).toHaveBeenCalledWith('data:test:test');
      expect(client.setAsync).toHaveBeenCalledWith(
        'data:test:test',
        expect.stringMatching('"id":"test"'),
      );
      expect(updated).toEqual({ new: true, id: 'test' });
    });

    it('should add new item if id previously contained no data', async () => {
      api.add = jest.fn().mockImplementation(async p => ({ ...p, id: 'test' }));
      client.getAsync.mockResolvedValue(null);
      const updated = await api.edit('test1', { new: true });
      expect(updated).toEqual({ id: 'test', new: true });
      expect(api.add).toHaveBeenCalledTimes(1);
      expect(api.add).toHaveBeenCalledWith({ new: true });
      expect(client.getAsync).toHaveBeenCalledTimes(1);
      expect(client.getAsync).toHaveBeenCalledWith('data:test:test1');
      expect(client.setAsync).not.toHaveBeenCalled();
    });

    it('should throw an error if unable to set data', async () => {
      client.getAsync.mockResolvedValue(JSON.stringify({ old: true }));
      client.setAsync.mockRejectedValue(new Error('test'));
      await expect(api.edit('test', { new: true })).rejects.toThrow('Unable to edit: test');

      client.setAsync.mockResolvedValue(null);
      await expect(api.edit('test', { new: true })).rejects.toThrow(
        'Unable to edit: updating data failed',
      );
    });
  });

  describe('add', () => {
    beforeEach(() => {
      uuidv4.mockClear();
      api = new RedisApi('test', client);
    });

    validatePayloadInput('add', true);

    it('should complete if valid object', async () => {
      uuidv4.mockReturnValue('test');
      client.existsAsync.mockResolvedValue(null);
      client.multiExecAsync.mockResolvedValue([1, 'OK']);
      const first = await api.add({ payload: true });
      expect(first).toEqual({ id: 'test', payload: true });
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(client.existsAsync).toHaveBeenCalledTimes(1);
      expect(client.existsAsync).toHaveBeenCalledWith('data:test:test');
      expect(client.multiExecAsync).toHaveBeenCalledWith([
        ['sadd', 'ids:test', 'test'],
        ['set', 'data:test:test', expect.any(String)],
      ]);
    });

    it('should regenerate id if generated one exists already', async () => {
      uuidv4.mockReturnValueOnce('test').mockReturnValueOnce('test1');
      client.existsAsync.mockResolvedValueOnce('{"test":true}').mockResolvedValueOnce(null);
      client.multiExecAsync.mockResolvedValue([1, 'OK']);
      const first = await api.add({ payload: true });
      expect(first).toEqual({ id: 'test1', payload: true });
      expect(uuidv4).toHaveBeenCalledTimes(2);
      expect(client.existsAsync).toHaveBeenCalledTimes(2);
      expect(client.existsAsync).toHaveBeenNthCalledWith(1, 'data:test:test');
      expect(client.existsAsync).toHaveBeenNthCalledWith(2, 'data:test:test1');
      expect(client.multiExecAsync).toHaveBeenCalledWith([
        ['sadd', 'ids:test', 'test1'],
        ['set', 'data:test:test1', expect.any(String)],
      ]);
    });

    it('should overwrite existing id property with new id', async () => {
      uuidv4.mockReturnValue('test');
      client.existsAsync.mockResolvedValue(null);
      client.multiExecAsync.mockResolvedValue([1, 'OK']);
      const first = await api.add({ payload: true, id: 'nottest' });
      expect(first).toEqual({ id: 'test', payload: true });
      expect(client.multiExecAsync).toHaveBeenCalledWith([
        ['sadd', 'ids:test', 'test'],
        ['set', 'data:test:test', expect.stringMatching('"id":"test"')],
      ]);
    });

    it('should throw an error if unable to verify existing data', async () => {
      uuidv4.mockReturnValue('test');
      client.existsAsync.mockRejectedValue(new Error('failed exists'));
      await expect(api.add({ payload: true })).rejects.toThrow('Unable to add: failed exists');
      expect(client.multiExecAsync).not.toHaveBeenCalled();
    });

    it('should throw an error if unable to set data due to exception', async () => {
      uuidv4.mockReturnValue('test');
      client.existsAsync.mockResolvedValue(null);
      client.multiExecAsync.mockRejectedValue(new Error('multi exec error'));
      await expect(api.add({ payload: true })).rejects.toThrow('Unable to add: multi exec error');
    });

    it('should throw an error if unable to set data due to failure response', async () => {
      uuidv4.mockReturnValue('test');
      client.existsAsync.mockResolvedValue(null);
      client.multiExecAsync.mockResolvedValue([null, 'OK']);
      await expect(api.add({ payload: true })).rejects.toThrow('Unable to add: could not complete');
      client.multiExecAsync.mockResolvedValue([1, null]);
      await expect(api.add({ payload: true })).rejects.toThrow('Unable to add: could not complete');
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      api = new RedisApi('test', client);
    });

    validateIdInput('delete');

    it('should return null if no data was previously stored at id', async () => {
      client.getAsync.mockResolvedValue(null);
      const res = await api.delete('test');
      expect(res).toBeNull();
      expect(client.getAsync).toHaveBeenCalledTimes(1);
      expect(client.getAsync).toHaveBeenCalledWith('data:test:test');
      expect(client.multiExecAsync).not.toHaveBeenCalled();
    });

    it('should delete and return data if data was stored at id', async () => {
      client.getAsync.mockResolvedValue(JSON.stringify({ payload: true }));
      client.multiExecAsync.mockResolvedValue([1, 1]);
      const res = await api.delete('test');
      expect(res).toEqual({ payload: true });
      expect(client.getAsync).toHaveBeenCalledTimes(1);
      expect(client.getAsync).toHaveBeenCalledWith('data:test:test');
      expect(client.multiExecAsync).toHaveBeenCalledTimes(1);
      expect(client.multiExecAsync).toHaveBeenCalledWith([
        ['srem', 'ids:test', 'test'],
        ['del', 'data:test:test'],
      ]);
    });

    it('should throw an error if unable to check for existing data', async () => {
      client.getAsync.mockRejectedValue(new Error('exists failed'));
      await expect(api.delete('test')).rejects.toThrow('Unable to delete: exists failed');
      expect(client.multiExecAsync).not.toHaveBeenCalled();
    });

    it('should throw an error if unable to delete due to exeception', async () => {
      client.getAsync.mockResolvedValue(JSON.stringify({ payload: true }));
      client.multiExecAsync.mockRejectedValue(new Error('multi exec failed'));
      await expect(api.delete('test')).rejects.toThrow('Unable to delete: multi exec failed');
    });

    it('should throw an error if unable to delete due to failed response', async () => {
      client.getAsync.mockResolvedValue(JSON.stringify({ payload: true }));
      client.multiExecAsync.mockResolvedValue([null, 1]);
      await expect(api.delete('test')).rejects.toThrow('Unable to delete: could not complete');
      client.multiExecAsync.mockResolvedValue([null, 0]);
      await expect(api.delete('test')).rejects.toThrow('Unable to delete: could not complete');
      client.multiExecAsync.mockResolvedValue([null, null]);
      await expect(api.delete('test')).rejects.toThrow('Unable to delete: could not complete');
      client.multiExecAsync.mockResolvedValue([0, null]);
      await expect(api.delete('test')).rejects.toThrow('Unable to delete: could not complete');
      client.multiExecAsync.mockResolvedValue([1, null]);
      await expect(api.delete('test')).rejects.toThrow('Unable to delete: could not complete');
    });
  });
});

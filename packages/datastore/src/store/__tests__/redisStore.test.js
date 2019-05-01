/* eslint-disable no-new */
jest.mock('redis', () => ({
  createClient: jest.fn(),
}));
jest.mock('../../api/redisApi');

import { createClient } from 'redis';

import RedisApi from '../../api/redisApi';
import Datasources from '../../utils/datasources';

import RedisStore from '../redisStore';

const RealRedisApi = jest.requireActual('../../api/redisApi').default;

describe('RedisStore', () => {
  beforeEach(() => {
    createClient.mockClear();
    createClient.mockReturnValue({});
    RedisApi.mockClear();
  });

  it('should construct properly', () => {
    const store = new RedisStore();
    expect(store.source).toBe(Datasources.redis);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith({});
  });

  it('should construct properly and pass redis options', () => {
    const store = new RedisStore({ redis: 'options' });
    expect(store.source).toBe(Datasources.redis);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith({ redis: 'options' });
  });

  describe('should throw if redis api contruction fails', () => {
    class ThrowApi extends RealRedisApi {
      constructor() {
        throw new Error('test throw');
      }
    }

    test('for monitorInfoGroups', () => {
      RedisApi.mockImplementation((...params) => {
        if (params[0] === 'monitorInfos') {
          return new ThrowApi(...params);
        }
        return new RealRedisApi(...params);
      });
      expect(() => {
        new RedisStore();
      }).toThrow('test throw');
    });

    test('for products', () => {
      RedisApi.mockImplementation((...params) => {
        if (params[0] === 'products') {
          return new ThrowApi(...params);
        }
        return new RealRedisApi(...params);
      });
      expect(() => {
        new RedisStore();
      }).toThrow('test throw');
    });

    test('for proxies', () => {
      RedisApi.mockImplementation((...params) => {
        if (params[0] === 'proxies') {
          return new ThrowApi(...params);
        }
        return new RealRedisApi(...params);
      });
      expect(() => {
        new RedisStore();
      }).toThrow('test throw');
    });

    test('for settings', () => {
      RedisApi.mockImplementation((...params) => {
        if (params[0] === 'settings') {
          return new ThrowApi(...params);
        }
        return new RealRedisApi(...params);
      });
      expect(() => {
        new RedisStore();
      }).toThrow('test throw');
    });

    test('for webhooks', () => {
      RedisApi.mockImplementation((...params) => {
        if (params[0] === 'webhooks') {
          return new ThrowApi(...params);
        }
        return new RealRedisApi(...params);
      });
      expect(() => {
        new RedisStore();
      }).toThrow('test throw');
    });
  });

  describe('should have correct api instance', () => {
    let store;

    beforeEach(() => {
      RedisApi.mockRestore();
      store = new RedisStore();
    });

    test('for monitorInfoGroups', () => {
      expect(store.monitorInfoGroups).toEqual(expect.any(RedisApi));
    });

    test('for products', () => {
      expect(store.products).toEqual(expect.any(RedisApi));
    });

    test('for proxies', () => {
      expect(store.proxies).toEqual(expect.any(RedisApi));
    });

    test('for settings', () => {
      expect(store.settings).toEqual(expect.any(RedisApi));
    });

    test('for webhooks', () => {
      expect(store.webhooks).toEqual(expect.any(RedisApi));
    });
  });
});

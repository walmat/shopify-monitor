/* eslint-disable no-new */
jest.mock('../../api/memoryApi');

import MemoryStore from '../memoryStore';
import Datasources from '../../utils/datasources';
import MemoryApi from '../../api/memoryApi';

const RealMemoryApi = jest.requireActual('../../api/memoryApi').default;

describe('MemoryStore', () => {
  beforeEach(() => {
    MemoryApi.mockClear();
    MemoryApi.mockImplementation(() => RealMemoryApi);
  });

  it('should contruct properly', () => {
    let store;
    expect(() => {
      store = new MemoryStore();
    }).not.toThrow();

    expect(store.source).toBe(Datasources.memory);
  });

  describe('should throw if monitor api contruction fails', () => {
    class ThrowApi extends RealMemoryApi {
      constructor(type) {
        super(type);
        throw new Error('test throw');
      }
    }

    test('for monitorInfoGroups', () => {
      MemoryApi.mockImplementation((...params) => {
        if (params[0] === 'monitorInfos') {
          return new ThrowApi(...params);
        }
        return new RealMemoryApi(...params);
      });
      expect(() => {
        new MemoryStore();
      }).toThrow('test throw');
    });

    test('for products', () => {
      MemoryApi.mockImplementation((...params) => {
        if (params[0] === 'products') {
          return new ThrowApi(...params);
        }
        return new RealMemoryApi(...params);
      });
      expect(() => {
        new MemoryStore();
      }).toThrow('test throw');
    });

    test('for proxies', () => {
      MemoryApi.mockImplementation((...params) => {
        if (params[0] === 'proxies') {
          return new ThrowApi(...params);
        }
        return new RealMemoryApi(...params);
      });
      expect(() => {
        new MemoryStore();
      }).toThrow('test throw');
    });

    test('for settings', () => {
      MemoryApi.mockImplementation((...params) => {
        if (params[0] === 'settings') {
          return new ThrowApi(...params);
        }
        return new RealMemoryApi(...params);
      });
      expect(() => {
        new MemoryStore();
      }).toThrow('test throw');
    });

    test('for webhooks', () => {
      MemoryApi.mockImplementation((...params) => {
        if (params[0] === 'webhooks') {
          return new ThrowApi(...params);
        }
        return new RealMemoryApi(...params);
      });
      expect(() => {
        new MemoryStore();
      }).toThrow('test throw');
    });
  });

  describe('should have correct api instance', () => {
    let store;

    beforeEach(() => {
      MemoryApi.mockRestore();
      store = new MemoryStore();
    });

    test('for monitorInfoGroups', () => {
      expect(store.monitorInfoGroups).toEqual(expect.any(MemoryApi));
    });

    test('for products', () => {
      expect(store.products).toEqual(expect.any(MemoryApi));
    });

    test('for proxies', () => {
      expect(store.proxies).toEqual(expect.any(MemoryApi));
    });

    test('for settings', () => {
      expect(store.settings).toEqual(expect.any(MemoryApi));
    });

    test('for webhooks', () => {
      expect(store.webhooks).toEqual(expect.any(MemoryApi));
    });
  });
});

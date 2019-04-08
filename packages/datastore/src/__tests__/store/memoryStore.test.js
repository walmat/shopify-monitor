/* eslint-disable no-new */
jest.mock('../../api/memoryApi');

import MemoryStore from '../../store/memoryStore';
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
      MemoryApi.mockImplementationOnce((...params) => new ThrowApi(...params));
      expect(() => {
        new MemoryStore();
      }).toThrow('test throw');
      expect(MemoryApi).toHaveBeenCalledTimes(1);
    });

    test('for proxies', () => {
      MemoryApi.mockImplementationOnce(
        (...params) => new RealMemoryApi(...params),
      ).mockImplementationOnce((...params) => new ThrowApi(...params));
      expect(() => {
        new MemoryStore();
      }).toThrow('test throw');
      expect(MemoryApi).toHaveBeenCalledTimes(2);
    });

    test('for settings', () => {
      MemoryApi.mockImplementationOnce((...params) => new RealMemoryApi(...params))
        .mockImplementationOnce((...params) => new RealMemoryApi(...params))
        .mockImplementationOnce((...params) => new ThrowApi(...params));
      expect(() => {
        new MemoryStore();
      }).toThrow('test throw');
      expect(MemoryApi).toHaveBeenCalledTimes(3);
    });

    test('for sites', () => {
      MemoryApi.mockImplementationOnce((...params) => new RealMemoryApi(...params))
        .mockImplementationOnce((...params) => new RealMemoryApi(...params))
        .mockImplementationOnce((...params) => new RealMemoryApi(...params))
        .mockImplementationOnce((...params) => new ThrowApi(...params));
      expect(() => {
        new MemoryStore();
      }).toThrow('test throw');
      expect(MemoryApi).toHaveBeenCalledTimes(4);
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

    test('for proxies', () => {
      expect(store.proxies).toEqual(expect.any(MemoryApi));
    });

    test('for settings', () => {
      expect(store.settings).toEqual(expect.any(MemoryApi));
    });

    test('for sites', () => {
      expect(store.sites).toEqual(expect.any(MemoryApi));
    });
  });
});

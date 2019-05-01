/* eslint-disable no-unused-expressions */
import Store from '../store';

describe('Abstract Store', () => {
  it('should throw an error when attempting to construct it', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new Store('test');
    }).toThrow();
  });

  describe('default implementation', () => {
    let store;

    beforeAll(() => {
      class SubStore extends Store {}
      store = new SubStore('test');
    });

    it('should return store correctly by default', () => {
      expect(store.source).toBe('test');
    });

    it('should throw error for get monitorInfoGroups', () => {
      expect(() => {
        store.monitorInfoGroups;
      }).toThrow(new Error('This needs to be overwritten in subclass!'));
    });

    it('should throw error for get products', () => {
      expect(() => {
        store.products;
      }).toThrow(new Error('This needs to be overwritten in subclass!'));
    });

    it('should throw error for get proxies', () => {
      expect(() => {
        store.proxies;
      }).toThrow(new Error('This needs to be overwritten in subclass!'));
    });

    it('should throw error for get settings', () => {
      expect(() => {
        store.settings;
      }).toThrow(new Error('This needs to be overwritten in subclass!'));
    });

    it('should throw error for get webhooks', () => {
      expect(() => {
        store.webhooks;
      }).toThrow(new Error('This needs to be overwritten in subclass!'));
    });
  });
});

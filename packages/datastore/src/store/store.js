/* eslint class-methods-use-this: ["error", { "exceptMethods": ["monitorInfoGroups", "proxies", "settings", "sites"] }] */

class Store {
  constructor(source) {
    if (new.target === Store) {
      throw new TypeError('Cannot contruct instances of this abstract class!');
    }
    this._source = source;
  }

  /**
   * Source of data for the store
   */
  get source() {
    return this._source;
  }

  /**
   * Api instance to manage monitor info groups
   */
  get monitorInfoGroups() {
    throw new Error('This needs to be overwritten in subclass!');
  }

  /**
   * Api instance to manage proxies
   */
  get proxies() {
    throw new Error('This needs to be overwritten in subclass!');
  }

  /**
   * Api instance to manage settings
   */
  get settings() {
    throw new Error('This needs to be overwritten in subclass!');
  }

  /**
   * Api instance to manage sites
   */
  get sites() {
    throw new Error('This needs to be overwritten in subclass!');
  }
}

export default Store;

// Standard BREAD api
class Api {
  constructor(type) {
    if (new.target === Api) {
      throw new TypeError('Cannot construct instances of this abstract class!');
    }
    this._type = type;
  }

  get type() {
    return this._type;
  }

  /**
   * Browse for all stored items
   *
   * @returns list of all stored items
   * @throws when operation could not be performed
   */
  browse() {
    throw new Error('This needs to be overwritten in subclass!');
  }

  /**
   * Read a specific item based on the given id
   *
   * @param {string} id id to retrieve
   * @returns {Object} payload with the given id
   * @throws when id is invalid or operation could not be performed
   */
  read(id) {
    throw new Error('This needs to be overwritten in subclass!');
  }

  /**
   * Edit a specific item with the given id
   *
   * If id is not found, this method will fallback to add
   *
   * @param {string} id id to edit
   * @param {Object} payload updated payload to store
   * @returns {Object} updated payload that has been stored
   * @throws when operation could not be performed
   */
  edit(id, payload) {
    throw new Error('This needs to be overwritten in subclass!');
  }

  /**
   * Add the given payload with a new id
   *
   * @param {Object} payload the new payload to add
   * @returns {Object} payload that has been added with a new id
   * @throws when operation could not be performed
   */
  add(payload) {
    throw new Error('This needs to be overwritten in subclass!');
  }

  /**
   * Delete the payload with the given id
   *
   * If id is invalid or no data is stored, `undefined` is returned
   *
   * @param {string} id the id to delete
   * @returns {Object} the object that was deleted
   * @throws when operation could not be performed
   */
  delete(id) {
    throw new Error('This needs to be overwritten in subclass!');
  }
}

export default Api;

/* eslint-disable import/first */
jest.mock('uuid/v4', () => jest.fn().mockImplementation(() => jest.requireActual('uuid/v4')()));

import uuidv4 from 'uuid/v4';
import MemoryApi from '../../api/memoryApi';

describe('MemoryApi', () => {
  let api;

  beforeEach(() => {
    api = new MemoryApi('test');
    uuidv4.mockClear();
  });

  it('should construct properly', () => {
    expect(() => {
      api = new MemoryApi('test');
    }).not.toThrow();
  });

  it('should return the correct type', () => {
    expect(api.type).toBe('test');
    api = new MemoryApi('testing');
    expect(api.type).toBe('testing');
  });

  describe('browse', () => {
    it('should return an empty array initially', async () => {
      expect(await api.browse()).toEqual([]);
    });

    it('should return objects after adding', async () => {
      const added = await api.add({ payload: 'test' });
      expect(await api.browse()).toEqual([added]);
    });

    it('should return an empty array after adding and removing objects', async () => {
      const added = await api.add({ payload: 'test' });
      expect(await api.browse()).toEqual([added]);
      await api.delete(added.id);
      expect(await api.browse()).toEqual([]);
    });
  });

  describe('read', () => {
    it('should throw for invalid id', async () => {
      return expect(api.read('testid')).rejects.toEqual(
        new Error('Payload with that id does not exist!'),
      );
    });

    it('should succeed when valid id is passed', async () => {
      const first = await api.add({ payload: '1' });
      const second = await api.add({ payload: 2 });

      const readFirst = await api.read(first.id);
      const readSecond = await api.read(second.id);

      expect(readFirst.payload).toBe('1');
      expect(readSecond.payload).toBe(2);
    });
  });

  describe('edit', () => {
    it('should overwrite payload if it exists', async () => {
      const first = await api.add({ payload: '1' });
      const second = await api.edit(first.id, { payload: '2' });
      const read = await api.read(first.id);
      expect(read).toEqual(second);
      expect(await api.browse()).toHaveLength(1);
    });

    it("should add new item if it doesn't exist", async () => {
      const first = await api.add({ payload: '1' });
      const second = await api.edit('testid', { payload: '2' });
      const read = await api.read(first.id);
      expect(read).toEqual(first);
      expect(read).not.toEqual(second);
      expect(second.id).not.toEqual('testid');
      expect(await api.browse()).toHaveLength(2);
    });

    it('should throw error if null/undefined is passed', async () => {
      await expect(api.edit('testid', null)).rejects.toThrow();
      await expect(api.edit('testid')).rejects.toThrow();
      const { id } = await api.add({ payload: true });
      await expect(api.edit(id, null)).rejects.toThrow();
      await expect(api.edit(id)).rejects.toThrow();
    });

    it('should throw error if non-object is passed', async () => {
      await expect(api.edit('testid', 'test')).rejects.toThrow();
      await expect(api.edit('testid', 2)).rejects.toThrow();
      const { id } = await api.add({ payload: true });
      await expect(api.edit(id, 'test')).rejects.toThrow();
      await expect(api.edit(id, 2)).rejects.toThrow();
    });
  });

  describe('add', () => {
    it('should throw error if null/undefined is passed', async () => {
      await expect(api.add(null)).rejects.toThrow();
      await expect(api.add()).rejects.toThrow();
    });

    it('should throw error if non-object is passed', async () => {
      await expect(api.add('test')).rejects.toThrow();
      await expect(api.add(2)).rejects.toThrow();
    });

    it('should complete if valid object', async () => {
      const first = await api.add({ payload: true, payload2: 'test' });
      expect(first.payload).toBeTruthy();
      expect(first.payload2).toBe('test');
    });

    it('should regenerate id if generated one exists already', async () => {
      uuidv4
        .mockImplementationOnce(() => 'test1')
        .mockImplementationOnce(() => 'test1')
        .mockImplementationOnce(() => 'test2');
      const first = await api.add({ payload: true });
      expect(first).toEqual({ id: 'test1', payload: true });
      const second = await api.add({ payload: true });
      expect(second).toEqual({ id: 'test2', payload: true });

      expect(uuidv4).toHaveBeenCalledTimes(3);
    });

    it('should overwrite existing id with new id', async () => {
      const first = await api.add({ payload: '1' });
      const second = await api.add(first);

      expect(await api.browse()).toHaveLength(2);
      expect((await api.read(first.id)).payload).toBe('1');
      expect((await api.read(second.id)).payload).toBe('1');
    });
  });

  describe('delete', () => {
    it('should do nothing if no items are stored', async () => {
      expect(await api.browse()).toEqual([]);
      expect(await api.delete('testid')).toBeUndefined();
      expect(await api.browse()).toEqual([]);
    });

    it('should do nothing if non-existent id is passed', async () => {
      await api.add({ payload: true });
      expect(await api.browse()).toHaveLength(1);
      expect(await api.delete('wrongid')).toBeUndefined();
      expect(await api.browse()).toHaveLength(1);
    });

    it('should remove existing id and return it', async () => {
      const first = await api.add({ payload: true });
      expect(await api.browse()).toHaveLength(1);
      const removed = await api.delete(first.id);
      expect(removed).toEqual(first);
      expect(await api.browse()).toHaveLength(0);
    });
  });
});

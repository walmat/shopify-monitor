import Api from '../../api/api';

describe('Abstract Api', () => {
  it('should throw an error then attempting to contruct it', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new Api('test');
    }).toThrow();
  });

  describe('default implementation', () => {
    let api;

    beforeAll(() => {
      class SubApi extends Api {}
      api = new SubApi('test');
    });

    it('should return type correctly by default', () => {
      expect(api.type).toBe('test');
    });

    it('should throw error for browse by default', () => {
      expect(api.browse()).rejects.toEqual(new Error('This needs to be overwritten in subclass!'));
    });

    it('should throw error for read by default', () => {
      expect(api.read('1')).rejects.toEqual(new Error('This needs to be overwritten in subclass!'));
    });

    it('should throw error for edit by default', () => {
      expect(api.edit('1', { payload: true })).rejects.toEqual(
        new Error('This needs to be overwritten in subclass!'),
      );
    });

    it('should throw error for add by default', () => {
      expect(api.add({ payload: true })).rejects.toEqual(
        new Error('This needs to be overwritten in subclass!'),
      );
    });

    it('should throw error for delete by default', () => {
      expect(api.delete('1')).rejects.toEqual(
        new Error('This needs to be overwritten in subclass!'),
      );
    });
  });
});

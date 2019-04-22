import promisifyRedisClient, { methodsToAutoConvert } from '../promisifyRedisClient';

describe('promisify redis client utility method', () => {
  it('should skip all promisify if client is undefined or null', () => {
    const updatedClient1 = promisifyRedisClient();
    const updatedClient2 = promisifyRedisClient(null);
    expect(updatedClient1).toBeUndefined();
    expect(updatedClient2).toBeNull();
  });

  it('should skip auto promisify if original method is undefined', () => {
    const client = {};
    const updatedClient = promisifyRedisClient(client);
    methodsToAutoConvert.forEach(name => {
      expect(updatedClient[name]).toBeUndefined();
      expect(updatedClient[`${name}Async`]).toBeUndefined();
    });
    expect(updatedClient.__promisified).toBeTruthy();
  });

  it('should setup auto promisify for all regular methods', () => {
    const client = {};
    methodsToAutoConvert.forEach(name => {
      client[name] = jest.fn();
    });
    const updatedClient = promisifyRedisClient(client);
    methodsToAutoConvert.forEach(name => {
      expect(updatedClient[`${name}Async`]).toBeDefined();
    });
    expect(updatedClient.__promisified).toBeTruthy();
  });

  it('should not perform setup twice on the same object', () => {
    const client = { __promisified: true };
    const updatedClient = promisifyRedisClient(client);
    expect(updatedClient.__promisified).toBeTruthy();
    expect(updatedClient.multiExecAsync).toBeUndefined();
  });

  describe('custom method setup', () => {
    describe('multiExecAsync', () => {
      let updatedClient;

      beforeEach(() => {
        updatedClient = promisifyRedisClient({
          multi: jest.fn(() => updatedClient),
          exec: jest.fn(),
        });
      });

      it('should setup method', () => {
        expect(updatedClient.multiExecAsync).toBeDefined();
      });

      it('should resolve if exec completes', async () => {
        updatedClient.exec.mockImplementationOnce(cb => {
          cb(null, 'resolved');
        });
        const response = await updatedClient.multiExecAsync('test');
        expect(response).toBe('resolved');
        expect(updatedClient.multi).toHaveBeenCalledWith('test');
        expect(updatedClient.exec).toHaveBeenCalledTimes(1);
      });

      it('should reject if exec fails', async () => {
        updatedClient.exec.mockImplementationOnce(cb => {
          cb(new Error('test'), 'resolved');
        });
        await expect(updatedClient.multiExecAsync('test2')).rejects.toThrow('test');
        expect(updatedClient.multi).toHaveBeenCalledWith('test2');
        expect(updatedClient.exec).toHaveBeenCalledTimes(1);
      });
    });
  });
});

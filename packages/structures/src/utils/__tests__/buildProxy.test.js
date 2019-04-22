import buildProxy from '../buildProxy';
import initialProxy from '../../initialStates/proxy';
import proxySpec from '../../definitions/proxy';

import SpecTester from '../../definitions/__tests__/__utils__/specTester';

describe('buildProxy utility function', () => {
  describe('should return the initial proxy state', () => {
    test('when undefined is passed', () => {
      expect(buildProxy(undefined)).toEqual(initialProxy);
    });

    test('when null is passed', () => {
      expect(buildProxy(null)).toEqual(initialProxy);
    });

    test('when empty string is passed', () => {
      expect(buildProxy('')).toEqual(initialProxy);
    });
  });

  describe('should fail proxy format check', () => {
    test('when only ip address is passed', () => {
      expect(() => {
        buildProxy('127.0.0.1');
      }).toThrow('Invalid proxy format');

      expect(() => {
        buildProxy('127.0.0.1:');
      }).toThrow('Invalid proxy format');
    });

    test('when only url is passed', () => {
      expect(() => {
        buildProxy('http://test.test.com');
      }).toThrow('Invalid proxy format');

      expect(() => {
        buildProxy('http://test.test.com:');
      }).toThrow('Invalid proxy format');
    });

    test('when ip, port and username are passed', () => {
      expect(() => {
        buildProxy('127.0.0.1:8080:user');
      }).toThrow('Invalid proxy format');

      expect(() => {
        buildProxy('127.0.0.1:8080:user:');
      }).toThrow('Invalid proxy format');
    });

    test('when url, port and username are passed', () => {
      expect(() => {
        buildProxy('https://test.test.com:8080:user');
      }).toThrow('Invalid proxy format');

      expect(() => {
        buildProxy('https://test.test.com:8080:user:');
      }).toThrow('Invalid proxy format');
    });

    test('when more than 4 parts are passed', () => {
      expect(() => {
        buildProxy('https://test.test.com:8080:user:pass:');
      }).toThrow('Invalid proxy format');

      expect(() => {
        buildProxy('127.0.0.1:8080:user:pass:extra');
      }).toThrow('Invalid proxy format');

      expect(() => {
        buildProxy('127.0.0.1:8080:user:pass:');
      }).toThrow('Invalid proxy format');
    });
  });

  describe('hostname format check', () => {
    test('should pass when valid ip', () => {
      const proxy = buildProxy('127.0.0.1:8080');
      expect(proxy.hostname).toBe('127.0.0.1');
      expect(proxy.port).toBe('8080');
    });

    test('should fail when invalid ip', () => {
      expect(() => {
        buildProxy('127.0.0.2345:80');
      }).toThrow('Invalid hostname format');

      expect(() => {
        buildProxy('127.0.256.1:80');
      }).toThrow('Invalid hostname format');

      expect(() => {
        buildProxy('127.2456.0.1:80');
      }).toThrow('Invalid hostname format');

      expect(() => {
        buildProxy('2135.0.0.1:80');
      }).toThrow('Invalid hostname format');
    });

    test('should pass when valid url', () => {
      let proxy = buildProxy('http://test.test.com:8080');
      expect(proxy.hostname).toBe('http://test.test.com');
      expect(proxy.port).toBe('8080');

      proxy = buildProxy('http://www.test.com:8080');
      expect(proxy.hostname).toBe('http://www.test.com');
      expect(proxy.port).toBe('8080');

      proxy = buildProxy('https://www.test.com:8080');
      expect(proxy.hostname).toBe('https://www.test.com');
      expect(proxy.port).toBe('8080');
    });

    test('should fail when invalid url', () => {
      expect(() => {
        buildProxy('blob:8080');
      }).toThrow('Invalid hostname format');
    });

    test('should fail when neither ip nor url', () => {
      expect(() => {
        buildProxy('asdf:8080');
      }).toThrow('Invalid hostname format');

      expect(() => {
        buildProxy('123:8080');
      }).toThrow('Invalid hostname format');

      expect(() => {
        buildProxy('123.23:8080');
      }).toThrow('Invalid hostname format');

      expect(() => {
        buildProxy('sdf123.sadfg235.asdf:8080');
      }).toThrow('Invalid hostname format');
    });
  });

  describe('port format check', () => {
    test('should pass for valid port ranges', () => {
      // test 100 random values within range
      for (let i = 0; i < 100; i += 1) {
        const random = Math.floor(Math.random() * Math.floor(65535));
        const proxy = buildProxy(`127.0.0.1:${random}`);
        expect(proxy.port).toBe(`${random}`);
      }
    });

    test('should fail for ports that are too high', () => {
      expect(() => {
        buildProxy('127.0.0.1:428731');
      }).toThrow('Invalid port format');
    });

    test('should fail for negative ports', () => {
      expect(() => {
        buildProxy('127.0.0.1:-123');
      }).toThrow('Invalid proxy format');
    });

    test('should fail for non-numeric port', () => {
      expect(() => {
        buildProxy('127.0.0.1:test');
      }).toThrow('Invalid proxy format');
    });
  });

  describe('should work', () => {
    let specTester;

    beforeAll(() => {
      specTester = new SpecTester(proxySpec, initialProxy);
    });

    test('for valid ip/port combo', () => {
      const expected = {
        id: '',
        requiresAuth: false,
        username: '',
        password: '',
        hostname: '127.0.0.1',
        port: '8080',
        value: '127.0.0.1:8080',
      };
      const proxy = buildProxy('127.0.0.1:8080');
      expect(specTester.checkSpec(proxy)).toBeTruthy();
      expect(proxy).toEqual(expected);
    });

    test('for valid ip/port/user/pass combo', () => {
      const expected = {
        id: '',
        requiresAuth: true,
        username: 'user',
        password: 'pass',
        hostname: '127.0.0.1',
        port: '8080',
        value: '127.0.0.1:8080:user:pass',
      };
      const proxy = buildProxy('127.0.0.1:8080:user:pass');
      expect(specTester.checkSpec(proxy)).toBeTruthy();
      expect(proxy).toEqual(expected);
    });

    test('for valid url/port combo', () => {
      const expected = {
        id: '',
        requiresAuth: false,
        username: '',
        password: '',
        hostname: 'https://test.com',
        port: '8080',
        value: 'https://test.com:8080',
      };
      const proxy = buildProxy('https://test.com:8080');
      expect(specTester.checkSpec(proxy)).toBeTruthy();
      expect(proxy).toEqual(expected);
    });

    test('for valid url/port/user/pass combo', () => {
      const expected = {
        id: '',
        requiresAuth: true,
        username: 'user',
        password: 'pass',
        hostname: 'https://test.com',
        port: '8080',
        value: 'https://test.com:8080:user:pass',
      };
      const proxy = buildProxy('https://test.com:8080:user:pass');
      expect(specTester.checkSpec(proxy)).toBeTruthy();
      expect(proxy).toEqual(expected);
    });
  });
});

import buildKeywordInfo from '../buildKeywordInfo';
import initialKeywordInfo from '../../initialStates/keywordInfo';
import keywordInfoSpec from '../../definitions/keywordInfo';

import SpecTester from '../../definitions/__tests__/__utils__/specTester';

describe('buildKeywordInfo utility function', () => {
  describe('should return initial state', () => {
    test('when undefined is passed', () => {
      expect(buildKeywordInfo(undefined)).toEqual(initialKeywordInfo);
    });

    test('when null is passed', () => {
      expect(buildKeywordInfo(null)).toEqual(initialKeywordInfo);
    });

    test('when empty string is passed', () => {
      expect(buildKeywordInfo('')).toEqual(initialKeywordInfo);
    });
  });

  describe('should fail for invalid format', () => {
    const testThrowFormatError = input => {
      expect(() => {
        buildKeywordInfo(input);
      }).toThrow('Invalid keyword format');
    };

    test('when input is not a comma-separated list', () => {
      ['+test:-test', 'test:-test', '+test:test', '-test:+test'].forEach(testThrowFormatError);
    });

    test('when input does not have pos/neg modifiers', () => {
      ['test', '+test, test', '+test,test', 'test,-test', 'test, -test'].forEach(
        testThrowFormatError,
      );
    });

    test('when input has a trailing comma', () => {
      testThrowFormatError('+test, ');
      testThrowFormatError('+test,');
    });
  });

  describe('should succeed', () => {
    let specTester;

    beforeAll(() => {
      specTester = new SpecTester(keywordInfoSpec, initialKeywordInfo);
    });

    test('when all positive keywords', () => {
      let expected = {
        positive: ['test', 'test2'],
        negative: [],
        value: '+test,+test2',
      };
      let keywordInfo = buildKeywordInfo('+test,+test2');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);

      expected = {
        positive: ['test2', 'test'],
        negative: [],
        value: '+test2, +test ',
      };
      keywordInfo = buildKeywordInfo('+test2, +test ');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);

      expected = {
        positive: ['test'],
        negative: [],
        value: '+test',
      };
      keywordInfo = buildKeywordInfo('+test');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);
    });

    test('when all negative', () => {
      let expected = {
        positive: [],
        negative: ['test', 'test2'],
        value: '-test,-test2',
      };
      let keywordInfo = buildKeywordInfo('-test,-test2');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);

      expected = {
        positive: [],
        negative: ['test2', 'test'],
        value: '-test2, -test ',
      };
      keywordInfo = buildKeywordInfo('-test2, -test ');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);

      expected = {
        positive: [],
        negative: ['test'],
        value: '-test',
      };
      keywordInfo = buildKeywordInfo('-test');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);
    });

    test('when mixed', () => {
      const expected = {
        positive: ['pos1', 'pos2'],
        negative: ['neg1', 'neg2'],
        value: '+pos1, +pos2, -neg1, -neg2',
      };
      let keywordInfo = buildKeywordInfo('+pos1, +pos2, -neg1, -neg2');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);

      expected.value = '-neg1, -neg2, +pos1, +pos2';
      keywordInfo = buildKeywordInfo('-neg1, -neg2, +pos1, +pos2');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);

      expected.value = '-neg1, +pos1, -neg2, +pos2';
      keywordInfo = buildKeywordInfo('-neg1, +pos1, -neg2, +pos2');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);

      expected.value = '+pos1, -neg1, -neg2, +pos2';
      keywordInfo = buildKeywordInfo('+pos1, -neg1, -neg2, +pos2');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);

      expected.value = '+pos1, -neg1, +pos2, -neg2';
      keywordInfo = buildKeywordInfo('+pos1, -neg1, +pos2, -neg2');
      expect(specTester.checkSpec(keywordInfo)).toBeTruthy();
      expect(keywordInfo).toEqual(expected);
    });
  });
});

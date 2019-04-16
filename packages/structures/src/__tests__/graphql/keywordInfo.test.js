import {
  KeywordInfoType,
  KeywordInfoDataInputType,
  KeywordInfoStringInputType,
} from '../../graphql/keywordInfo';
import initialKeyword from '../../initialStates/keywordInfo';

import QuerySchemaTester from '../__utils__/querySchemaTester';
import MutationSchemaTester from '../__utils__/mutationSchemaTester';

describe('KeywordInfo (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(KeywordInfoType, initialKeyword);

    queryTester.generateTestSuite();
  });

  describe('Mutations', () => {
    describe('of KeywordInfoStringInput', () => {
      const mutationTester = new MutationSchemaTester(
        KeywordInfoStringInputType,
        initialKeyword,
        KeywordInfoType,
      );

      mutationTester.generateTestsForKey(
        'value',
        { value: '' },
        ['valid', ''],
        [3, {}, [], false, true, null],
      );
    });

    describe('of KeywordInfoDataInput', () => {
      const mutationTester = new MutationSchemaTester(
        KeywordInfoDataInputType,
        initialKeyword,
        KeywordInfoType,
      );

      mutationTester.generateTestsForKey(
        'positive',
        { positive: [], negative: [] },
        [[], ['test'], [''], ['test', ''], null],
        [3, {}, false, true],
      );
      mutationTester.generateTestsForKey(
        'negative',
        { positive: [], negative: [] },
        [[], ['test'], [''], ['test', ''], null],
        [3, {}, false, true],
      );
    });
  });
});

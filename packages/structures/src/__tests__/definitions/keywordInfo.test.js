import keywordInfoSpec from '../../definitions/keywordInfo';
import initialKeywordInfo from '../../initialStates/keywordInfo';

import SpecTester from '../__utils__/specTester';

describe('keyword info spec', () => {
  const specTester = new SpecTester(keywordInfoSpec, initialKeywordInfo);

  specTester.testKey(['', 'test'], [null, undefined, false, 8, [], {}], 'value');
  specTester.testKey(
    [[], [''], ['test'], ['', 'test']],
    [null, undefined, false, 'test', [80], ['test', 80], ['test', {}], {}],
    'positive',
  );
  specTester.testKey(
    [[], [''], ['test'], ['', 'test']],
    [null, undefined, false, 'test', [80], ['test', 80], ['test', {}], {}],
    'negative',
  );
});

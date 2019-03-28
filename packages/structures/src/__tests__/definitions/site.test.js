import siteSpec from '../../definitions/site';
import initialSite from '../../initialStates/site';

import SpecTester from '../__utils__/specTester';

describe('site spec', () => {
  const specTester = new SpecTester(siteSpec, initialSite);

  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'id');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'name');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'url');
});

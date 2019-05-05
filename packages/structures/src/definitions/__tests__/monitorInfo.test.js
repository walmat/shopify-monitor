import monitorInfoSpec from '../monitorInfo';
import initialMonitorInfo from '../../initialStates/monitorInfo';
import initialSite from '../../initialStates/site';
import initialKeywordInfo from '../../initialStates/keywordInfo';
import initialProduct from '../../initialStates/product';

import SpecTester from './__utils__/specTester';

describe('monitor info spec', () => {
  const specTester = new SpecTester(monitorInfoSpec, initialMonitorInfo);

  specTester.testKey(['', 'test'], [null, undefined, false, 8, [], {}], 'id');
  specTester.testKey([null, undefined, 0, 80], [false, 'test', [], {}], 'index');
  specTester.testKey([null, undefined, '', 'test'], [false, 8, [], {}], 'status');
  specTester.testKey([0, 80], [null, undefined, false, 'test', [], {}], 'monitorDelay');
  specTester.testKey([0, 80], [null, undefined, false, 'test', [], {}], 'errorDelay');

  specTester.testKey(
    [initialKeywordInfo],
    [null, undefined, false, 80, 'test', [], {}],
    'keywords',
  );
  specTester.testKey([initialSite], [null, undefined, false, 80, 'test', [], {}], 'site');
  specTester.testKey([[], [initialProduct], null], [false, 80, 'test', '', {}], 'products');
  specTester.testKey([[], [initialSite]], [null, undefined, false, 80, 'test', '', {}], 'webhooks');
});

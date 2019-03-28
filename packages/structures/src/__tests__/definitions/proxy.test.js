import proxySpec from '../../definitions/proxy';
import initialProxy from '../../initialStates/proxy';

import SpecTester from '../__utils__/specTester';

describe.only('proxy spec', () => {
  const specTester = new SpecTester(proxySpec, initialProxy);

  specTester.testKey(['', 'test'], [null, undefined, false, 8, [], {}], 'id');
  specTester.testKey([true, false], [null, undefined, '', 'test', 8, [], {}], 'requiresAuth');
  specTester.testKey(['', 'test'], [null, undefined, false, 8, [], {}], 'username');
  specTester.testKey(['', 'test'], [null, undefined, false, 8, [], {}], 'password');
  specTester.testKey(['', 'test'], [null, undefined, false, 8, [], {}], 'hostname');
  specTester.testKey(['', 'test'], [null, undefined, false, 8, [], {}], 'port');
  specTester.testKey(['', 'test'], [null, undefined, false, 8, [], {}], 'value');
});

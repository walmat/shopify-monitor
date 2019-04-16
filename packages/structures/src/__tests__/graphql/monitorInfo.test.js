import { MonitorInfoType, MonitorInfoInputType } from '../../graphql/monitorInfo';
import initialMonitor from '../../initialStates/monitorInfo';

import QuerySchemaTester from '../__utils__/querySchemaTester';
import MutationSchemaTester from '../__utils__/mutationSchemaTester';

describe('MonitorInfo (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(MonitorInfoType, initialMonitor, {
      site: 'site { id, name, url }',
      keywords: 'keywords { negative, positive, value }',
    });

    queryTester.generateTestSuite();
  });

  describe('Mutations', () => {
    const mutationTester = new MutationSchemaTester(
      MonitorInfoInputType,
      initialMonitor,
      MonitorInfoType,
      {
        site: 'site { id, name, url }',
        keywordsRaw: null,
        keywords: 'keywords { negative, positive, value }',
      },
    );
    const base = {
      index: initialMonitor.index,
      site: { name: '', url: '' },
      keywords: { positive: [], negative: [] },
      keywordsRaw: { value: '' },
      status: initialMonitor.status,
      monitorDelay: initialMonitor.monitorDelay,
      errorDelay: initialMonitor.errorDelay,
    };

    mutationTester.generateTestsForKey(
      'index',
      base,
      [3, null],
      [3.4, 'test', '', {}, [], true, false],
    );
    mutationTester.generateTestsForKey(
      'status',
      base,
      ['valid', '', null],
      [3, {}, [], false, true],
    );
    mutationTester.generateTestsForKey(
      'monitorDelay',
      base,
      [3, null],
      [3.4, 'test', '', {}, [], true, false],
    );
    mutationTester.generateTestsForKey(
      'errorDelay',
      base,
      [3, null],
      [3.4, 'test', '', {}, [], true, false],
    );
  });
});

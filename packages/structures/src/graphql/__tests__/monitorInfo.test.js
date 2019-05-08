import { MonitorInfoType, MonitorInfoInputType } from '../monitorInfo';
import initialMonitor from '../../initialStates/monitorInfo';
import initialProduct from '../../initialStates/product';
import initialSite from '../../initialStates/site';

import QuerySchemaTester from './__utils__/querySchemaTester';
import MutationSchemaTester from './__utils__/mutationSchemaTester';

describe('MonitorInfo (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(MonitorInfoType, initialMonitor, {
      site: 'site { id, name, url }',
      keywords: 'keywords { negative, positive, value }',
      products:
        'products { id, url, site, name, image, variants { id, size, inStock }, price, timestamp }',
      webhooks: 'webhooks { id, name, url }',
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
        products:
          'products { id, url, site, name, image, variants { id, size, inStock }, price, timestamp }',
        webhooks: 'webhooks { id, name, url }',
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
      products: [],
      webhooks: [],
    };
    const baseSite = { ...initialSite };
    delete baseSite.id;

    const baseProduct = { ...initialProduct };
    delete baseProduct.id;

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
    mutationTester.generateTestsForKey(
      'products',
      base,
      [[], [{ ...baseProduct }], null],
      [3.4, 'test', '', { test: 'test' }, true, false],
    );
    mutationTester.generateTestsForKey(
      'webhooks',
      base,
      [[], [{ ...baseSite }], null],
      [3.4, 'test', '', { test: 'test' }, true, false],
    );
  });
});

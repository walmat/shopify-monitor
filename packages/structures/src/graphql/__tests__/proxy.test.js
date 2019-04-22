import { ProxyType, ProxyDataInputType, ProxyStringInputType } from '../proxy';
import initialProxy from '../../initialStates/proxy';

import QuerySchemaTester from './__utils__/querySchemaTester';
import MutationSchemaTester from './__utils__/mutationSchemaTester';

describe('Proxy (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(ProxyType, initialProxy);

    queryTester.generateTestSuite();
  });

  describe('Mutations', () => {
    describe('of ProxyStringInput', () => {
      const mutationTester = new MutationSchemaTester(
        ProxyStringInputType,
        initialProxy,
        ProxyType,
      );
      mutationTester.generateTestsForKey(
        'value',
        { value: '' },
        ['valid', ''],
        [3, {}, [], false, true, null],
      );
    });

    describe('of ProxyDataInput', () => {
      const mutationTester = new MutationSchemaTester(ProxyDataInputType, initialProxy, ProxyType);

      mutationTester.generateTestsForKey(
        'requiresAuth',
        {},
        [true, false, null],
        [3, 'test', {}, []],
      );
      mutationTester.generateTestsForKey(
        'username',
        {},
        ['test', '', null],
        [3, {}, [], true, false],
      );
      mutationTester.generateTestsForKey(
        'password',
        {},
        ['test', '', null],
        [3, {}, [], true, false],
      );
      mutationTester.generateTestsForKey(
        'hostname',
        {},
        ['test', '', null],
        [3, {}, [], true, false],
      );
      mutationTester.generateTestsForKey('port', {}, ['test', '', null], [3, {}, [], true, false]);
    });
  });
});

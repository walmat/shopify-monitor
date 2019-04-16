import { SettingsType, SettingsInputType } from '../../graphql/settings';
import initialSettings from '../../initialStates/settings';

import QuerySchemaTester from '../__utils__/querySchemaTester';
import MutationSchemaTester from '../__utils__/mutationSchemaTester';

describe('Settings (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(SettingsType, initialSettings);

    queryTester.generateTestSuite();
  });

  describe('Mutations', () => {
    const mutationTester = new MutationSchemaTester(
      SettingsInputType,
      initialSettings,
      SettingsType,
    );

    mutationTester.generateTestsForKey(
      'defaultErrorDelay',
      {},
      [3, null],
      [3.4, 'test', '', {}, [], true, false],
    );
    mutationTester.generateTestsForKey(
      'defaultMonitorDelay',
      {},
      [3, null],
      [3.4, 'test', '', {}, [], true, false],
    );
  });
});

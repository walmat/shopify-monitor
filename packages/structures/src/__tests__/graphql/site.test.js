import { SiteType, SiteInputType } from '../../graphql/site';
import initialSite from '../../initialStates/site';

import QuerySchemaTester from '../__utils__/querySchemaTester';
import MutationSchemaTester from '../__utils__/mutationSchemaTester';

describe('Site (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(SiteType, initialSite);

    queryTester.generateTestSuite();
  });

  describe('Mutations', () => {
    const mutationTester = new MutationSchemaTester(SiteInputType, initialSite, SiteType);

    mutationTester.generateTestsForKey('name', {}, ['test', '', null], [3, {}, [], true, false]);
    mutationTester.generateTestsForKey('url', {}, ['test', '', null], [3, {}, [], true, false]);
  });
});

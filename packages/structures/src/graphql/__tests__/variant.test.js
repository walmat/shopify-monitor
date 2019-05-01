import { VariantType, VariantInputType } from '../variant';
import initialVariant from '../../initialStates/variant';

import QuerySchemaTester from './__utils__/querySchemaTester';
import MutationSchemaTester from './__utils__/mutationSchemaTester';

describe('Variant (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(VariantType, initialVariant);

    queryTester.generateTestSuite();
  });

  describe('Mutations', () => {
    const mutationTester = new MutationSchemaTester(VariantInputType, initialVariant, VariantType);

    mutationTester.generateTestsForKey('id', {}, ['test', '', null], [3, {}, [], true, false]);
    mutationTester.generateTestsForKey('size', {}, ['test', '', null], [3, {}, [], true, false]);
  });
});

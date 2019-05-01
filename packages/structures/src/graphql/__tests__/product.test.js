import { ProductType, ProductInputType } from '../product';
import initialProduct from '../../initialStates/product';
import initialVariant from '../../initialStates/variant';

import QuerySchemaTester from './__utils__/querySchemaTester';
import MutationSchemaTester from './__utils__/mutationSchemaTester';

describe('Product (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(ProductType, initialProduct, {
      variants: 'variants { id, size }',
    });

    queryTester.generateTestSuite();
  });

  describe('Mutations', () => {
    const mutationTester = new MutationSchemaTester(ProductInputType, initialProduct, ProductType, {
      variants: 'variants { id, size }',
    });
    const base = { ...initialProduct };
    delete base.id;

    mutationTester.generateTestsForKey('url', base, ['valid', '', null], [3, {}, [], false, true]);
    mutationTester.generateTestsForKey('site', base, ['valid', '', null], [3, {}, [], false, true]);
    mutationTester.generateTestsForKey('name', base, ['valid', '', null], [3, {}, [], false, true]);
    mutationTester.generateTestsForKey(
      'image',
      base,
      ['valid', '', null],
      [3, {}, [], false, true],
    );
    mutationTester.generateTestsForKey(
      'price',
      base,
      ['valid', '', null],
      [3, {}, [], false, true],
    );
    mutationTester.generateTestsForKey(
      'timestamp',
      base,
      ['valid', '', null],
      [3, {}, [], false, true],
    );
    mutationTester.generateTestsForKey(
      'variants',
      base,
      [[], [{ ...initialVariant }], null],
      [3, { test: 'test' }, 'test', '', false, true],
    );
  });
});

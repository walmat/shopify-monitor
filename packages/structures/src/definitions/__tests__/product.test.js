import productSpec from '../product';
import initialProduct from '../../initialStates/product';
import initialVariant from '../../initialStates/variant';

import SpecTester from './__utils__/specTester';

describe('product spec', () => {
  const specTester = new SpecTester(productSpec, initialProduct);

  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'id');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'url');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'site');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'name');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'image');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'price');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'timestamp');

  specTester.testKey(
    [[], [{ ...initialVariant }]],
    [null, false, undefined, 8, '', {}],
    'variants',
  );
});

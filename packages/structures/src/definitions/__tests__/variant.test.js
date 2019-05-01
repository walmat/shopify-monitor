import variantSpec from '../variant';
import initialVariant from '../../initialStates/variant';

import SpecTester from './__utils__/specTester';

describe('variant spec', () => {
  const specTester = new SpecTester(variantSpec, initialVariant);

  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'id');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'size');
});

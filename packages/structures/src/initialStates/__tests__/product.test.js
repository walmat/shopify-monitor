import initialProduct from '../product';
import productSpec from '../../definitions/product';

import complianceTest from './__utils__/stateSpecCompliance';

describe('product state', () => {
  complianceTest(initialProduct, productSpec);
});

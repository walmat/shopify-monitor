import initialVariant from '../variant';
import variantSpec from '../../definitions/variant';

import complianceTest from './__utils__/stateSpecCompliance';

describe('variant state', () => {
  complianceTest(initialVariant, variantSpec);
});

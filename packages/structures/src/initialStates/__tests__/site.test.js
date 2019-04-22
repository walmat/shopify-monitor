import initialSite from '../site';
import siteSpec from '../../definitions/site';

import complianceTest from './__utils__/stateSpecCompliance';

describe('monitor info state', () => {
  complianceTest(initialSite, siteSpec);
});

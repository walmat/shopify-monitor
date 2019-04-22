import initialProxy from '../proxy';
import proxySpec from '../../definitions/proxy';

import complianceTest from './__utils__/stateSpecCompliance';

describe('proxy state', () => {
  complianceTest(initialProxy, proxySpec);
});

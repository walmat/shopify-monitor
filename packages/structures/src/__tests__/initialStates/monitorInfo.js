import initialMonitorInfo from '../../initialStates/monitorInfo';
import monitorInfoSpec from '../../definitions/monitorInfo';

import complianceTest from '../__utils__/stateSpecCompliance';

describe('monitor info state', () => {
  complianceTest(initialMonitorInfo, monitorInfoSpec);
});

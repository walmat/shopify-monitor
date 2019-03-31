import initialSettings from '../../initialStates/settings';
import settingsSpec from '../../definitions/settings';

import complianceTest from '../__utils__/stateSpecCompliance';

describe('monitor info state', () => {
  complianceTest(initialSettings, settingsSpec);
});

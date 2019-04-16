import settingsSpec from '../settings';
import initialSettings from '../../initialStates/settings';

import SpecTester from './__utils__/specTester';

describe('settings spec', () => {
  const specTester = new SpecTester(settingsSpec, initialSettings);

  specTester.testKey([0, 80], [null, undefined, false, 'test', [], {}], 'defaultErrorDelay');
  specTester.testKey([0, 80], [null, undefined, false, 'test', [], {}], 'defaultMonitorDelay');
});

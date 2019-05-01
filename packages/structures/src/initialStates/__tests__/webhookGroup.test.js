import initialWebhookGroup from '../webhookGroup';
import webhookGroupSpec from '../../definitions/webhookGroup';

import complianceTest from './__utils__/stateSpecCompliance';

describe('webhook group state', () => {
  complianceTest(initialWebhookGroup, webhookGroupSpec);
});

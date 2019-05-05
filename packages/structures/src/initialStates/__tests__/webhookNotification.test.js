import initialWebhookNotification from '../webhookNotification';
import webhookNotificationSpec from '../../definitions/webhookNotification';

import complianceTest from './__utils__/stateSpecCompliance';

describe('webhook notification state', () => {
  complianceTest(initialWebhookNotification, webhookNotificationSpec);
});

import webhookNotificationSpec from '../webhookNotification';
import initialWebhookNotification from '../../initialStates/webhookNotification';

import SpecTester from './__utils__/specTester';

describe('webhook notification spec', () => {
  const specTester = new SpecTester(webhookNotificationSpec, initialWebhookNotification);

  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'type');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'url');
});

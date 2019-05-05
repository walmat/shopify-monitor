import { WebhookNotificationType, WebhookNotificationInputType } from '../webhookNotification';
import initialWebhookNotification from '../../initialStates/webhookNotification';

import QuerySchemaTester from './__utils__/querySchemaTester';
import MutationSchemaTester from './__utils__/mutationSchemaTester';

describe('WebhookNotification (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(WebhookNotificationType, initialWebhookNotification);

    queryTester.generateTestSuite();
  });

  describe('Mutations', () => {
    const mutationTester = new MutationSchemaTester(
      WebhookNotificationInputType,
      initialWebhookNotification,
      WebhookNotificationType,
    );
    const base = { ...initialWebhookNotification };

    mutationTester.generateTestsForKey('type', base, ['valid', '', null], [3, {}, [], false, true]);
    mutationTester.generateTestsForKey('url', base, ['valid', '', null], [3, {}, [], false, true]);
  });
});

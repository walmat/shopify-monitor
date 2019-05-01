import { WebhookGroupType, WebhookGroupInputType } from '../webhookGroup';
import initialWebhookGroup from '../../initialStates/webhookGroup';

import QuerySchemaTester from './__utils__/querySchemaTester';
import MutationSchemaTester from './__utils__/mutationSchemaTester';

describe('WebhookGroup (GraphQL)', () => {
  describe('Queries', () => {
    const queryTester = new QuerySchemaTester(WebhookGroupType, initialWebhookGroup, {
      webhooks: 'webhooks { id, name, url }',
    });

    queryTester.generateTestSuite();
  });

  describe('Mutations', () => {
    const mutationTester = new MutationSchemaTester(
      WebhookGroupInputType,
      initialWebhookGroup,
      WebhookGroupType,
      {
        webhooks: 'webhooks { id, name, url }',
      },
    );
    const base = { ...initialWebhookGroup };
    delete base.id;

    mutationTester.generateTestsForKey('name', base, ['valid', '', null], [3, {}, [], false, true]);
    mutationTester.generateTestsForKey(
      'webhooks',
      base,
      [[], [{ name: '', url: '' }], null],
      [3, { test: 'test' }, 'test', false, true],
    );
  });
});

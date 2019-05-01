import webhookGroupSpec from '../webhookGroup';
import initialWebhookGroup from '../../initialStates/webhookGroup';
import initialSite from '../../initialStates/site';

import SpecTester from './__utils__/specTester';

describe('webhook group spec', () => {
  const specTester = new SpecTester(webhookGroupSpec, initialWebhookGroup);

  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'id');
  specTester.testKey(['', 'test'], [null, false, undefined, 8, [], {}], 'name');
  specTester.testKey(
    [[], [{ ...initialSite }]],
    [null, false, undefined, 8, 'test', '', {}],
    'webhooks',
  );
});

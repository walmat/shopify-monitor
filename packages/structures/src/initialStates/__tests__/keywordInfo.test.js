import initialKeywordInfo from '../keywordInfo';
import keywordInfoSpec from '../../definitions/keywordInfo';

import complianceTest from './__utils__/stateSpecCompliance';

describe('keyword info state', () => {
  complianceTest(initialKeywordInfo, keywordInfoSpec);
});

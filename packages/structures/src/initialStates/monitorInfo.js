// Initial State for monitor info
// See definitions/monitorInfo.js for descriptions of each field
import initialSite from './site';
import initialKeywordInfo from './keywordInfo';
import initialSettings from './settings';

export default {
  id: null,
  index: 0,
  site: initialSite,
  keywords: initialKeywordInfo,
  status: null,
  monitorDelay: initialSettings.defaultMonitorDelay,
  errorDelay: initialSettings.defaultErrorDelay,
};

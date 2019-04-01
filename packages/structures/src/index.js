import keywordInfoDefn from './definitions/keywordInfo';
import monitorInfoDefn from './definitions/monitorInfo';
import proxyDefn from './definitions/proxy';
import settingsDefn from './definitions/settings';
import siteDefn from './definitions/site';
import siteListDefn from './definitions/siteList';

import navbarState from './initialStates/navbar';
import keywordInfoState from './initialStates/keywordInfo';
import monitorInfoState from './initialStates/monitorInfo';
import proxyState from './initialStates/proxy';
import settingsState from './initialStates/settings';
import siteState from './initialStates/site';
import siteListState from './initialStates/siteList';

import buildKeywordInfo from './utils/buildKeywordInfo';
import buildProxyInfo from './utils/buildProxy';

const definitions = {
  keywordInfoDefn,
  monitorInfoDefn,
  proxyDefn,
  settingsDefn,
  siteDefn,
  siteListDefn,
};
const initialStates = {
  navbarState,
  keywordInfoState,
  monitorInfoState,
  proxyState,
  settingsState,
  siteState,
  siteListState,
};
const utils = { buildKeywordInfo, buildProxyInfo };

export { definitions, initialStates, utils };

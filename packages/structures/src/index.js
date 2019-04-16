import keywordInfoDefn from './definitions/keywordInfo';
import monitorInfoDefn from './definitions/monitorInfo';
import proxyDefn from './definitions/proxy';
import settingsDefn from './definitions/settings';
import siteDefn from './definitions/site';

import {
  KeywordInfoType,
  KeywordInfoDataInputType,
  KeywordInfoStringInputType,
} from './graphql/keywordInfo';
import { MonitorInfoType, MonitorInfoInputType } from './graphql/monitorInfo';
import { ProxyType, ProxyDataInputType, ProxyStringInputType } from './graphql/proxy';
import { SettingsType, SettingsInputType } from './graphql/settings';
import { SiteType, SiteInputType } from './graphql/site';

import keywordInfoState from './initialStates/keywordInfo';
import monitorInfoState from './initialStates/monitorInfo';
import proxyState from './initialStates/proxy';
import settingsState from './initialStates/settings';
import siteState from './initialStates/site';

import buildKeywordInfo from './utils/buildKeywordInfo';
import buildProxyInfo from './utils/buildProxy';

const definitions = { keywordInfoDefn, monitorInfoDefn, proxyDefn, settingsDefn, siteDefn };
const graphql = {
  KeywordInfoType,
  KeywordInfoDataInputType,
  KeywordInfoStringInputType,
  MonitorInfoType,
  MonitorInfoInputType,
  ProxyType,
  ProxyDataInputType,
  ProxyStringInputType,
  SettingsType,
  SettingsInputType,
  SiteType,
  SiteInputType,
};
const initialStates = { keywordInfoState, monitorInfoState, proxyState, settingsState, siteState };
const utils = { buildKeywordInfo, buildProxyInfo };

export { definitions, graphql, initialStates, utils };

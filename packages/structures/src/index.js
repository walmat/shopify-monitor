import keywordInfoDefn from './definitions/keywordInfo';
import monitorInfoDefn from './definitions/monitorInfo';
import productDefn from './definitions/product';
import proxyDefn from './definitions/proxy';
import settingsDefn from './definitions/settings';
import siteDefn from './definitions/site';
import variantDefn from './definitions/variant';
import webhookGroupDefn from './definitions/webhookGroup';
import webhookNotificationDefn from './definitions/webhookNotification';

import {
  KeywordInfoType,
  KeywordInfoDataInputType,
  KeywordInfoStringInputType,
} from './graphql/keywordInfo';
import { MonitorInfoType, MonitorInfoInputType } from './graphql/monitorInfo';
import { ProductType, ProductInputType } from './graphql/product';
import { ProxyType, ProxyDataInputType, ProxyStringInputType } from './graphql/proxy';
import { SettingsType, SettingsInputType } from './graphql/settings';
import { SiteType, SiteInputType } from './graphql/site';
import { VariantType, VariantInputType } from './graphql/variant';
import { WebhookGroupType, WebhookGroupInputType } from './graphql/webhookGroup';
import {
  WebhookNotificationType,
  WebhookNotificationInputType,
} from './graphql/webhookNotification';

import keywordInfoState from './initialStates/keywordInfo';
import monitorInfoState from './initialStates/monitorInfo';
import productState from './initialStates/product';
import proxyState from './initialStates/proxy';
import settingsState from './initialStates/settings';
import siteState from './initialStates/site';
import variantState from './initialStates/variant';
import webhookGroupState from './initialStates/webhookGroup';
import webhookNotificationState from './initialStates/webhookNotification';

import buildKeywordInfo from './utils/buildKeywordInfo';
import buildProxyInfo from './utils/buildProxy';

const definitions = {
  keywordInfoDefn,
  monitorInfoDefn,
  productDefn,
  proxyDefn,
  settingsDefn,
  siteDefn,
  variantDefn,
  webhookGroupDefn,
  webhookNotificationDefn,
};
const graphql = {
  KeywordInfoType,
  KeywordInfoDataInputType,
  KeywordInfoStringInputType,
  MonitorInfoType,
  MonitorInfoInputType,
  ProductType,
  ProductInputType,
  ProxyType,
  ProxyDataInputType,
  ProxyStringInputType,
  SettingsType,
  SettingsInputType,
  SiteType,
  SiteInputType,
  VariantType,
  VariantInputType,
  WebhookGroupType,
  WebhookGroupInputType,
  WebhookNotificationType,
  WebhookNotificationInputType,
};
const initialStates = {
  keywordInfoState,
  monitorInfoState,
  productState,
  proxyState,
  settingsState,
  siteState,
  variantState,
  webhookGroupState,
  webhookNotificationState,
};
const utils = { buildKeywordInfo, buildProxyInfo };

export { definitions, graphql, initialStates, utils };

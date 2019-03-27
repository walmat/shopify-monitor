/**
 * This file is a shared import point for all actions.
 */
import makeActionCreator from './actions/actionCreator';

// import * as home from './actions/profiles/homeActions';
import * as sites from './actions/sites/sitesActions';
// import * as proxies from './actions/server/proxiesActions';
import * as settings from './actions/settings/settingsActions';
import * as navbar from './actions/navbar/navbarActions';

// Global Actions
export const GLOBAL_ACTIONS = {
  RESET: '@@RESET',
};

export const globalActions = {
  reset: makeActionCreator(GLOBAL_ACTIONS.RESET),
};

// Reimports
// export const {
//   profileActions,
//   mapProfileFieldToKey,
//   mapLocationFieldToKey,
//   mapPaymentFieldToKey,
//   PROFILE_ACTIONS,
//   PROFILE_FIELDS,
//   PAYMENT_FIELDS,
//   LOCATION_FIELDS,
// } = proxies;

export const { sitesActions, mapSitesFieldsToKey, SITES_ACTIONS, SITES_FIELDS } = sites;

// export const {
//   serverActions,
//   mapServerFieldToKey,
//   subMapToKey,
//   SERVER_ACTIONS,
//   SERVER_FIELDS,
// } = home;

export const {
  settingsActions,
  mapSettingsFieldToKey,
  SETTINGS_ACTIONS,
  SETTINGS_FIELDS,
} = settings;

export const { navbarActions, mapActionsToRoutes, NAVBAR_ACTIONS, ROUTES } = navbar;

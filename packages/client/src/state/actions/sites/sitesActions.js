/* eslint-disable no-underscore-dangle */
// import _ from 'lodash';
import makeActionCreator from '../actionCreator';

// Top level Actions
export const SITES_ACTIONS = {
  ADD: 'ADD_SITE',
  REMOVE: 'REMOVE_SITE',
  EDIT: 'EDIT_SITE',
  SELECT: 'SELECT_SITE',
  UPDATE: 'UPDATE_SITE',
  STATUS: 'UPDATE_STATUS',
  ERROR: 'SITE_HANDLE_ERROR',
};

// Private API Requests
const _addSiteRequest = async site => {
  // TODO: Replace this with an actual API call
  const copy = JSON.parse(JSON.stringify(site));
  return { site: copy };
};

const _updateSiteRequest = async (id, site) => {
  // TODO: Replace this with an actual API call
  // API will likely do something like this:
  const copy = JSON.parse(JSON.stringify(site));

  if (copy.edits !== null) {
    copy.profile = copy.edits.profile || copy.profile;
    copy.product = copy.edits.product || copy.product;
    copy.sizes = copy.edits.sizes || copy.sizes;
    copy.site = copy.edits.site || copy.site;
    if (copy.site.auth) {
      // if we need auth, choose the correct user/pass combo
      copy.username = copy.edits.site ? copy.edits.username : copy.username;
      copy.password = copy.edits.site ? copy.edits.password : copy.password;
    } else {
      // Clear out the user/pass component since we don't need auth
      copy.username = '';
      copy.password = '';
    }
  }

  return { id, site: copy };
};

const _destroySiteRequest = async (id, type) => {
  if (!id) {
    throw new Error('no site given');
  }
  // TODO - API call to destroy site (stop if needed)
  return {
    id,
    type,
  };
};

const _statusSiteRequest = async (id, message) => {
  if (id) {
    return {
      id,
      message,
    };
  }
  throw new Error('Invalid site structure');
};

const _startSiteRequest = async (site, proxies = []) => {
  if (site.status === 'running') {
    throw new Error('Already running');
  } else {
    // TODO - API call to start the site monitor
    return { site };
  }
};

const _stopSiteRequest = async site => {
  if (site.status === 'stopped') {
    throw new Error('Already stopped');
  } else {
    // TODO - API call here to stop site
    return { site };
  }
};

// Private Actions
const _addSite = makeActionCreator(SITES_ACTIONS.ADD, 'response');
const _destroySite = makeActionCreator(SITES_ACTIONS.REMOVE, 'response');
const _updateSite = makeActionCreator(SITES_ACTIONS.UPDATE, 'response');
const _statusSite = makeActionCreator(SITES_ACTIONS.STATUS, 'response');
const _startSite = makeActionCreator(SITES_ACTIONS.START, 'response');
const _stopSite = makeActionCreator(SITES_ACTIONS.STOP, 'response');

// Public Actions
const editSite = makeActionCreator(SITES_ACTIONS.EDIT, 'id', 'field', 'value');
const selectSite = makeActionCreator(SITES_ACTIONS.SELECT, 'site');
const handleError = makeActionCreator(SITES_ACTIONS.ERROR, 'action', 'error');

// Public Thunks
const addSite = site => dispatch =>
  _addSiteRequest(site).then(
    response => dispatch(_addSite(response)),
    error => dispatch(handleError(SITES_ACTIONS.ADD, error)),
  );

const destroySite = (site, type) => dispatch =>
  _destroySiteRequest(site, type).then(
    response => dispatch(_destroySite(response)),
    error => dispatch(handleError(SITES_ACTIONS.REMOVE, error)),
  );

const updateSite = (id, site) => (dispatch, getState) =>
  _updateSiteRequest(id, site).then(
    response => {
      dispatch(_updateSite(response));
      const state = getState();
      if (state.selectedSite && state.selectedSite.id === response.id) {
        dispatch(selectSite(null));
      }
    },
    error => dispatch(handleError(SITES_ACTIONS.UPDATE, error)),
  );

const statusSite = (id, message) => dispatch =>
  _statusSiteRequest(id, message).then(
    response => dispatch(_statusSite(response)),
    error => dispatch(handleError(SITES_ACTIONS.STATUS, error)),
  );

const clearEdits = (id, site) => {
  // Clear the edits so the update clears them out properly
  const copy = JSON.parse(JSON.stringify(site));
  copy.edits = null;
  return (dispatch, getState) =>
    _updateSiteRequest(id, copy).then(
      response => {
        dispatch(_updateSite(response));
        const state = getState();
        if (state.selectedSite && state.selectedSite.id === response.id) {
          dispatch(selectSite(null));
        }
      },
      error => dispatch(handleError(SITES_ACTIONS.UPDATE, error)),
    );
};

const startSite = (site, proxies) => dispatch =>
  _startSiteRequest(site, proxies).then(
    response => dispatch(_startSite(response)),
    error => dispatch(handleError(SITES_ACTIONS.START, error)),
  );

const stopSite = site => dispatch =>
  _stopSiteRequest(site).then(
    response => dispatch(_stopSite(response)),
    error => dispatch(handleError(SITES_ACTIONS.STOP, error)),
  );

// Field Edits
export const SITES_FIELDS = {
  EDIT_PRODUCT: 'EDIT_PRODUCT',
  EDIT_USERNAME: 'EDIT_USERNAME',
  EDIT_PASSWORD: 'EDIT_PASSWORD',
  EDIT_SITE: 'EDIT_SITE',
  EDIT_PROFILE: 'EDIT_PROFILE',
  EDIT_SIZES: 'EDIT_SIZES',
};

export const sitesActions = {
  add: addSite,
  destroy: destroySite,
  edit: editSite,
  clearEdits,
  select: selectSite,
  update: updateSite,
  status: statusSite,
  start: startSite,
  stop: stopSite,
  error: handleError,
};

export const mapSitesFieldsToKey = {
  [SITES_FIELDS.EDIT_PRODUCT]: 'product',
  [SITES_FIELDS.EDIT_USERNAME]: 'username',
  [SITES_FIELDS.EDIT_PASSWORD]: 'password',
  [SITES_FIELDS.EDIT_SITE]: 'site',
  [SITES_FIELDS.EDIT_PROFILE]: 'profile',
  [SITES_FIELDS.EDIT_SIZES]: 'sizes',
};

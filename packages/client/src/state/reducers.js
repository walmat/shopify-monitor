/**
 * Container for all state reducers. Reducers are available in their specific
 * files, this is just a shared import point.
 */
import { newSiteReducer, selectedSiteReducer } from './reducers/sites/siteReducer';
import siteListReducer from './reducers/sites/siteListReducer';
import settingsReducer from './reducers/settings/settingsReducer';
import { navbarReducer, initialNavbarState } from './reducers/navbar/navbarReducer';
import { GLOBAL_ACTIONS } from './actions';

import { initialSitesStates } from '../utils/definitions/siteDefinitions';
import { initialSettingsStates } from '../utils/definitions/settingsDefintions';

/**
 * Application State
 */
export const initialState = {
  navbar: initialNavbarState,
  sites: initialSitesStates.list,
  newSite: initialSitesStates.site,
  selectedSite: initialSitesStates.site,
  settings: initialSettingsStates.settings,
  proxies: initialSettingsStates.proxies,
};

const topLevelReducer = (state = initialState, action) => {
  // Return State if a null/undefined action is given
  if (!action) {
    return state;
  }
  // Check for reset and return initial state
  if (action.type === GLOBAL_ACTIONS.RESET) {
    return { ...initialState };
  }

  // If not a reset, handle the action with sub reducers
  const changes = {
    navbar: navbarReducer(state.navbar, action),
    sites: siteListReducer(state.sites, action),
    newSite: newSiteReducer(state.newSite, action),
    selectedSite: selectedSiteReducer(state.selectedTask, action),
    settings: settingsReducer(state.settings, action),
  };

  return Object.assign({}, state, changes);
};

export default topLevelReducer;

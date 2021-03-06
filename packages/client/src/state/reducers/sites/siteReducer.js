import { SITES_ACTIONS, SITES_FIELDS, mapSitesFieldsToKey } from '../../actions';
import { initialSitesStates } from '../../../utils/definitions/siteDefinitions';

export function siteReducer(state = initialSitesStates.site, action) {
  const change = {};
  if (action.type === SITES_ACTIONS.EDIT) {
    switch (action.field) {
      case SITES_FIELDS.EDIT_SITE: {
        break;
      }
      default:
        break;
    }
  }
  return Object.assign({}, state, change);
}

export function newSiteReducer(state = initialSitesStates.site, action) {
  switch (action.type) {
    case SITES_ACTIONS.EDIT: {
      // only modify the current site if the action id is null
      if (!action.id) {
        return siteReducer(state, action);
      }
      break;
    }
    case SITES_ACTIONS.ADD: {
      if (action.errors) {
        return Object.assign({}, state, {
          errors: Object.assign({}, state.errors, action.errors),
        });
      }
      // If we have a response error, we should do nothing
      if (!action.response || !action.response.task) {
        return Object.assign({}, state);
      }
      // If adding a valid new site, we should reset the current site to default values
      return Object.assign({}, state, initialSitesStates.site);
    }
    default:
      break;
  }

  return Object.assign({}, state);
}

export function selectedSiteReducer(state = initialSitesStates.site, action) {
  switch (action.type) {
    case SITES_ACTIONS.SELECT: {
      // if the user is toggling
      if (!action.site) {
        return Object.assign({}, initialSitesStates.site);
      }
      // Set the next state to the selected profile
      return Object.assign({}, action.site);
    }
    default:
      break;
  }

  return Object.assign({}, state);
}

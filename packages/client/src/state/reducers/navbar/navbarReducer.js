import { mapActionsToRoutes } from '../../actions';

export const initialNavbarState = {
  location: '/',
};

export function navbarReducer(state = initialNavbarState, action) {
  const change = {
    location: mapActionsToRoutes[action.type] || state.location,
  };
  return Object.assign({}, state, change);
}
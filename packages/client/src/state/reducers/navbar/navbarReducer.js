import { initialStates } from '@monitor/structures';
import { mapActionsToRoutes } from '../../actions';

export default function navbarReducer(state = initialStates.navbarState, action) {
  const change = {
    location: mapActionsToRoutes[action.type] || state.location,
  };
  return Object.assign({}, state, change);
}

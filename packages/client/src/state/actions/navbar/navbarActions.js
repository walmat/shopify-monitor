import makeActionCreator from '../actionCreator';

// Top Level Actions
export const NAVBAR_ACTIONS = {
  ROUTE_HOME: 'ROUTE_HOME',
  ROUTE_SITES: 'ROUTE_SITES',
  ROUTE_PROXIES: 'ROUTE_PROXIES',
  ROUTE_SETTINGS: 'ROUTE_SETTINGS',
};

export const ROUTES = {
  HOME: '/',
  SITES: '/sites',
  PROXIES: '/proxies',
  SETTINGS: '/settings',
};

export const mapActionsToRoutes = {
  [NAVBAR_ACTIONS.ROUTE_HOME]: ROUTES.HOME,
  [NAVBAR_ACTIONS.ROUTE_SITES]: ROUTES.SITES,
  [NAVBAR_ACTIONS.ROUTE_PROXIES]: ROUTES.PROXIES,
  [NAVBAR_ACTIONS.ROUTE_SETTINGS]: ROUTES.SETTINGS,
};

// Private Action Object Generator for Reducer
const _routeAction = type => makeActionCreator(type, 'history');

// Public General Route Action
const route = (type, history) => (dispatch) => {
  let _type = type;
  if (!mapActionsToRoutes[type]) {
    _type = NAVBAR_ACTIONS.ROUTE_HOME;
  }
  history.push(mapActionsToRoutes[_type] || '/');
  dispatch(_routeAction(_type)(history));
};

// Public Specific Route Action Generator
const routeAction = type => history => route(type, history);

export const navbarActions = {
  route,
  routeHome: routeAction(NAVBAR_ACTIONS.ROUTE_TASKS),
  routeSites: routeAction(NAVBAR_ACTIONS.ROUTE_SITES),
  routeProxies: routeAction(NAVBAR_ACTIONS.ROUTE_PROXIES),
  routeSettings: routeAction(NAVBAR_ACTIONS.ROUTE_SETTINGS),
};

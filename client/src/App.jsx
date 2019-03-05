import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import Header from './components/Header';
import Home from './components/Home';
import Sites from './components/Sites';
import Proxies from './components/Proxies';
import Settings from './components/Settings';
import NotFound from './components/NotFound';

import { ROUTES } from './state/actions';

export class App extends PureComponent {
  render() {
    const { store } = this.props;
    const { navbar: { location: stateLocation } } = store.getState();
    const windowLocation = window.location.pathname;
    let redirectRoute = ROUTES.HOME;
    if (windowLocation !== stateLocation) {
      redirectRoute = stateLocation;
    }
    return (
      <Provider store={store}>
        <Router>
          <div>
            <Header />
            <Switch>
              <Route exact path={ROUTES.HOME} component={Home} />
              <Route path={ROUTES.SITES} component={Sites} />
              <Route path={ROUTES.PROXIES} component={Proxies} />
              <Route path={ROUTES.SETTINGS} component={Settings} />
              <Route component={NotFound} />
              <Route path="/">
                <Redirect to={redirectRoute} />
              </Route>
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

App.propTypes = {
  store: PropTypes.objectOf(PropTypes.any).isRequired,
};

const createApp = (store, props) => <App store={store} {...props} />;

export default createApp;

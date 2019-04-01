import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import logo from '../_assets/logo.svg';
import { ROUTES, NAVBAR_ACTIONS, navbarActions } from '../state/actions';

import '../styles/_header.scss';

class HeaderPrimitive extends Component {
  static _renderHeaderCol({ routeName, className, onClick, onKeyPress }) {
    return (
      <li key={routeName}>
        <div className="nav-item header__nav-item">
          <div
            role="button"
            tabIndex={0}
            title={routeName}
            onKeyPress={onKeyPress}
            className={`${className} nav-link header__nav-link`}
            onClick={onClick}
          >
            {routeName}
          </div>
        </div>
      </li>
    );
  }

  constructor(props) {
    super(props);
    const classNameCalc = (...supportedRoutes) => route =>
      supportedRoutes.includes(route) ? 'active' : null;
    this.defaultRouteProps = {
      [NAVBAR_ACTIONS.ROUTE_HOME]: {
        routeName: 'home',
        classNameGenerator: classNameCalc(ROUTES.HOME, '/'),
      },
      [NAVBAR_ACTIONS.ROUTE_SITES]: {
        routeName: 'sites',
        classNameGenerator: classNameCalc(ROUTES.SITES),
      },
      [NAVBAR_ACTIONS.ROUTE_PROXIES]: {
        routeName: 'proxies',
        classNameGenerator: classNameCalc(ROUTES.PROXIES),
      },
      [NAVBAR_ACTIONS.ROUTE_SETTINGS]: {
        routeName: 'settings',
        classNameGenerator: classNameCalc(ROUTES.SETTINGS),
      },
    };
  }

  renderHeaderRow(route, { routeName, classNameGenerator }) {
    const { onKeyPress, onRoute, header, history } = this.props;
    const className = classNameGenerator(header.location);
    const props = {
      routeName,
      onKeyPress,
      className,
      onClick: () => onRoute(route, history),
    };
    return HeaderPrimitive._renderHeaderCol(props);
  }

  renderHeaderRows() {
    return [
      NAVBAR_ACTIONS.ROUTE_HOME,
      NAVBAR_ACTIONS.ROUTE_SITES,
      NAVBAR_ACTIONS.ROUTE_PROXIES,
      NAVBAR_ACTIONS.ROUTE_SETTINGS,
    ].map(route => this.renderHeaderRow(route, this.defaultRouteProps[route]));
  }

  render() {
    const { history, onKeyPress, onRoute } = this.props;
    return (
      <div className="header navbar navbar-expand-sm">
        <div className="container">
          <div
            role="button"
            tabIndex={0}
            onKeyPress={onKeyPress}
            onClick={() => onRoute(ROUTES.HOME, history)}
            className="navbar-brand header__nav-item"
          >
            <img className="header__logo" src={logo} alt="Nebula" />
          </div>
          <ul className="navbar-nav">{this.renderHeaderRows()}</ul>
        </div>
      </div>
    );
  }
}

HeaderPrimitive.propTypes = {
  history: PropTypes.objectOf(PropTypes.any).isRequired,
  header: PropTypes.objectOf(PropTypes.any).isRequired,
  onRoute: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func,
};

HeaderPrimitive.defaultProps = {
  onKeyPress: () => {},
};

function mapStateToProps(state) {
  const { header } = state;
  return { header };
}

export const mapDispatchToProps = dispatch => ({
  onRoute: (route, history) => dispatch(navbarActions.route(route, history)),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(HeaderPrimitive));

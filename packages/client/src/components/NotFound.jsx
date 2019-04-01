import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { ReactComponent as FourOhFour } from '../_assets/404.svg';
import { ReactComponent as AstroMan } from '../_assets/astroman.png';

import { ROUTES, navbarActions } from '../state/actions';

class NotFoundPrimitive extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageLoaded: false,
      fourOhFourLoaded: false,
      astrotop: '0px',
      astroright: '0px',
    };
  }

  componentDidMount() {
    this.setState({
      pageLoaded: true,
    });
  }

  onMouseMove(e) {
    this.setState({
      astrotop: `${e.clientY / 8}px`,
      astroright: `${e.clientX / 8}px`,
    });
  }

  render() {
    const { onRoute, onKeyPress, history } = this.props;
    const { pageLoaded, fourOhFourLoaded, astroTop, astroRight } = this.state;
    return (
      <div className="flex main-wrap justifyCenter">
        <div className="main-container flex">
          <CSSTransition
            in={pageLoaded}
            timeout={600}
            classNames="fourOhFour"
            onEntered={() => {
              this.setState({
                fourOhFourLoaded: true,
                astrotop: '10px',
                astroright: '30px',
              });
            }}
            unmountOnExit
          >
            {() => (
              <div
                className="fourOhFour flex justifyCenter"
                onMouseMove={e => {
                  this.onMouseMove(e);
                }}
                onMouseOut={() => {
                  this.setState({ astrotop: '10px', astroright: '30px' });
                }}
                onBlur={() => {}}
              >
                <FourOhFour />
                <AstroMan
                  className="astroman"
                  style={{ paddingTop: astroTop, paddingRight: astroRight }}
                />
              </div>
            )}
          </CSSTransition>
          <CSSTransition in={fourOhFourLoaded} timeout={600} classNames="error-text" unmountOnExit>
            {() => (
              <div className="error-text flex justifyCenter">
                <h3>Oops… Looks like you got lost</h3>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyPress={onKeyPress}
                  onClick={() => onRoute(ROUTES.HOME, history)}
                >
                  GO HOME
                </div>
              </div>
            )}
          </CSSTransition>
        </div>
      </div>
    );
  }
}

NotFoundPrimitive.propTypes = {
  history: PropTypes.objectOf(PropTypes.any).isRequired,
  onRoute: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func,
};

NotFoundPrimitive.defaultProps = {
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
)(withRouter(NotFoundPrimitive));

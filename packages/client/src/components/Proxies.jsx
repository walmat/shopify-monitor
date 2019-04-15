import React, { Component } from 'react';
import { connect } from 'react-redux';

import '../styles/proxies.scss';

class Proxies extends Component {
  componentDidMount() {}

  render() {
    return <div />;
  }
}

Proxies.propTypes = {};

function mapStateToProps(state) {
  const { sites, settings } = state;
  return {
    sites,
    settings,
  };
}

export const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Proxies);

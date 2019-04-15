import React, { Component } from 'react';
import { connect } from 'react-redux';

import '../styles/settings.scss';

class Settings extends Component {
  componentDidMount() {}

  render() {
    return <div />;
  }
}

Settings.propTypes = {};

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
)(Settings);

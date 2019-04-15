import React, { Component } from 'react';
import { connect } from 'react-redux';
import siteDefns from '../utils/definitions/siteDefinitions';
import settingsDefns from '../utils/definitions/settingsDefintions';
import SiteRow from './SiteRow';
import '../styles/home.scss';

/**
 * Component entails:
 * 1. Ability to do database operations (flush, etc.)
 * 2. Ability to do monitor operations (start & stop)
 */
class Home extends Component {
  componentDidMount() {}

  renderTableRows() {
    const { sites } = this.props;
    return sites.map(site => <SiteRow key={site.id} site={site} />);
  }

  render() {
    return <div />;
  }
}

Home.propTypes = {
  sites: siteDefns.siteList.isRequired,
  settings: settingsDefns.settings.isRequired,
};

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
)(Home);

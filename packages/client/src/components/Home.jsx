import React, { Component } from 'react';
import { connect } from 'react-redux';
import { definitions } from '@monitor/structures';

import SiteRow from './SiteRow';

import '../styles/_home.scss';

class Home extends Component {
  componentDidMount() {}

  renderTableRows() {
    const { sites } = this.props;
    return sites.map(site => <SiteRow key={site.id} site={site} />);
  }

  render() {
    const { sites, settings } = this.props;
    const { monitorDelay } = settings;
    const siteListTotalValue = sites.length || 0;
    console.log(this.props);
    return <div className="home" />;
  }
}

Home.propTypes = {
  sites: definitions.siteListDefn.isRequired,
  settings: definitions.settingsDefn.isRequired,
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

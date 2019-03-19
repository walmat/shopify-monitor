import React, { Component } from 'react';
import { Container, Row, Col } from 'react-grid-system';
import { connect } from 'react-redux';
import siteDefns from '../utils/definitions/siteDefinitions';
import settingsDefns from '../utils/definitions/settingsDefintions';

class Sites extends Component {
  render() {
    return (
      <div className="sites">
        <Container>
          <Row />
        </Container>
      </div>
    );
  }
}

Sites.propTypes = {
  site: siteDefns.site.isRequired,
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
)(Sites);

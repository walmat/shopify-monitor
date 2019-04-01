import React, { Component } from 'react';
import { Container, Row } from 'react-grid-system';
import { connect } from 'react-redux';
import { definitions } from '@monitor/structures';

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
  site: definitions.siteDefn.isRequired,
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
)(Sites);

import React, { Component } from 'react';
import { Row, Col } from 'react-grid-system';
import { connect } from 'react-redux';
import siteDefns from '../utils/definitions/siteDefinitions';

import '../styles/row.scss';

class SiteRow extends Component {
  componentDidMount() {}

  render() {
    const { site } = this.props;
    const keywords = site.keywords.positive.concat(site.keywords.negative);
    return (
      <Row className="site-row">
        <Col sm={1} className="site-row--center">
          <p>{site.id}</p>
        </Col>
        <Col sm={2} className="site-row--center">
          <p>{site.name}</p>
        </Col>
        <Col sm={3} className="site-row--center">
          <p>{keywords.map(k => `${k} `)}</p>
        </Col>
        <Col sm={2} className="site-row--center">
          <p>None</p>
        </Col>
        <Col sm={2} className="site-row--center">
          <p>0</p>
        </Col>
        <Col sm={2} className="site-row--center">
          <p>12 seconds ago</p>
        </Col>
      </Row>
    );
  }
}

SiteRow.propTypes = {
  site: siteDefns.site.isRequired,
};

export const mapStateToProps = (state, ownProps) => ({
  site: ownProps.site,
});

export const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SiteRow);

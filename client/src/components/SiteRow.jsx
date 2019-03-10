import React, { Component } from 'react';
import { Row, Col } from 'react-grid-system';
import { connect } from 'react-redux';
import siteDefns from '../utils/definitions/siteDefinitions';

class SiteRow extends Component {
  componentDidMount() {}

  render() {
    const { site } = this.props;
    const keywords = site.keywords.positive.concat(site.keywords.negative);
    return (
      <Row className="sites">
        <Col sm={1} className="sites--center">
          {site.id}
        </Col>
        <Col sm={2} className="sites--center">
          {site.name}
        </Col>  
        <Col sm={3} className="sites--center">
          {keywords.map(k => k + ' ')}
        </Col>
        <Col sm={3} className="sites--center">
          None
        </Col>
        <Col sm={3} className="sites--center">
          0
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

export default connect(mapStateToProps, mapDispatchToProps)(SiteRow);

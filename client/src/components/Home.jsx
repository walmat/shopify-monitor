import React, { Component } from 'react';
import { Container, Row, Col } from 'react-grid-system';
import { connect } from 'react-redux';
import styled from 'styled-components';
import siteDefns from '../utils/definitions/siteDefinitions';
import settingsDefns from '../utils/definitions/settingsDefintions';

import SiteRow from './SiteRow';

import '../styles/home.scss';

const MessageBox = styled.div`
  margin: 0 auto;
  margin-top: 30px;
  padding: 20px;
  text-align: center;
  background-color: #B8D9D2;
  border-radius: 20px;
  width: 100%;
`;

const Message = styled.span`
  font-weight: 700;
  color: #EF415E;
`;

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
    return (
      <div className="home">
        <Container>
          <Row className="announcement">
            <Col sm={12} className="expand">
              <MessageBox>
                Monitoring: <Message>{`${siteListTotalValue} ${siteListTotalValue === 1 ? 'site' : 'sites '}`}</Message>
                every <Message>{`${monitorDelay}`}</Message> ms
            </MessageBox>
            </Col>
          </Row>
          <Container className="table--container">
            <Row className="table--header">
              <Col sm={1} className="table--header__center">
                <p>#</p>
              </Col>
              <Col sm={2} className="table--header__center">
                <p>Site</p>
              </Col>  
              <Col sm={3} className="table--header__center">
                <p>Keywords</p>
              </Col>
              <Col sm={2} className="table--header__center">
                <p>Proxy</p>
              </Col>
              <Col sm={2} className="table--header__center">
                <p>Products Found</p>
              </Col>
              <Col sm={2} className="table--header__center">
                <p>Last Updated</p>
              </Col>
            </Row>
            {this.renderTableRows()}
            <Row className="table--footer">
              <Col sm={12} className="table--footer__center"></Col>
            </Row>
          </Container>
        </Container>
      </div>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);

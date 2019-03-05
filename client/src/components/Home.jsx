import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import siteDefns from '../utils/definitions/siteDefinitions';
import settingsDefns from '../utils/definitions/settingsDefintions';

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

  render() {
    const { sites, settings } = this.props;
    const { monitorDelay } = settings;
    const siteListTotalValue = sites.length || 0;
    console.log(this.props);
    return (
      <div className="home">
        <div className="container">
          <MessageBox>
            Monitoring: <Message>{`${siteListTotalValue} ${siteListTotalValue === 1 ? 'site' : 'sites '}`}</Message>
            every <Message>{`${monitorDelay}`}</Message> ms
          </MessageBox>
        </div>
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

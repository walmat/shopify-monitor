import React from 'react';
import styled from 'styled-components';

const MessageBox = styled.div`
  margin: 0 auto;
  margin-top: 30px;
  padding: 40px;
  text-align: center;
  background-color: #edbcc6;
  border-radius: 20px;
  width: 100%;
  height: 100%;
`;

const Settings = () => (
  <div>
    <div className="container">
      <MessageBox>This is the settings page.</MessageBox>
    </div>
  </div>
);

export default Settings;

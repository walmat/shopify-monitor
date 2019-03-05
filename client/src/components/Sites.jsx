import React from 'react';
import styled from 'styled-components';

const MessageBox = styled.div`
  margin: 0 auto;
  margin-top: 30px;
  padding: 40px;
  text-align: center;
  background-color: #EDBCC6;
  border-radius: 20px;
  width: 100%;
`;

const Sites = () => (
  <div className="sites">
    <div className="container">
      <MessageBox>This is the sites page.</MessageBox>
    </div>
  </div>
);

export default Sites;

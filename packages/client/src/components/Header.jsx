import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../_assets/logo.svg';

import { ROUTES } from '../state/actions';

const Navbar = styled.div`
  background: #161318 !important;
  color: #F5F5F5;
`;

const LogoImage = styled.img`
  height: 32px;
`;

const Header = () => (
  <Navbar className="navbar navbar-dark bg-dark navbar-expand-sm">
    <div className="container">
      <Link to="/" className="navbar-brand">
        <LogoImage src={logo} alt="Logo" />
      </Link>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link className="nav-link" to={ROUTES.HOME}>
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={ROUTES.SITES}>
            Sites
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={ROUTES.PROXIES}>
            Proxies
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={ROUTES.SETTINGS}>
            Settings
          </Link>
        </li>
      </ul>
    </div>
  </Navbar>
);

export default Header;

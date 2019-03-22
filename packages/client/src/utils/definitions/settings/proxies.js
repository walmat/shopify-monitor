import PropTypes from 'prop-types';

export const initialProxiesState = [];

const proxy = PropTypes.shape({
  id: PropTypes.string,
  inUse: PropTypes.bool,
  ip: PropTypes.string,
  port: PropTypes.string,
  user: PropTypes.string,
  pass: PropTypes.string,
});

const proxies = PropTypes.arrayOf(proxy);

export default proxies;

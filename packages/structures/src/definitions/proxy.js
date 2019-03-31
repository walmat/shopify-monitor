import PropTypes from 'prop-types';

// Proxy Info Definition
export default PropTypes.shape({
  // Id of the proxy object
  id: PropTypes.string.isRequired,

  // flag to tell if proxy requires authentication
  requiresAuth: PropTypes.bool.isRequired,

  // Username for proxy authentication
  // NOTE: will not be used if `requiresAuth` is false
  username: PropTypes.string.isRequired,

  // Password for proxy authentication
  // NOTE: will not be used if `requiresAuth` is false
  password: PropTypes.string.isRequired,

  // domain or ip part of the proxy
  hostname: PropTypes.string.isRequired,

  // port part of the proxy
  port: PropTypes.string.isRequired,

  // combined output of proxy in the format:
  // <hostname>:<port>[:<username>:<password>]
  // NOTE: if `requiresAuth` is false, the username and
  //       password will be omitted
  value: PropTypes.string.isRequired,
});

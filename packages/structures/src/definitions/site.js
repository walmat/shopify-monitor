import PropTypes from 'prop-types';

// Site Definition
export default PropTypes.shape({
  // Id of the site
  id: PropTypes.string.isRequired,

  // Name of the site (for display purposes only)
  name: PropTypes.string.isRequired,

  // Url of the site (for monitor purposes)
  url: PropTypes.string.isRequired,
});

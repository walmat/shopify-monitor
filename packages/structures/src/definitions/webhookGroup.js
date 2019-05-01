import PropTypes from 'prop-types';

import site from './site';

// Webhook Group Definition
export default PropTypes.shape({
  // Id of the webhook group
  id: PropTypes.string.isRequired,

  // Name of the group (for display purposes)
  name: PropTypes.string.isRequired,

  // List of webhooks associated with the group
  webhooks: PropTypes.arrayOf(site).isRequired,
});

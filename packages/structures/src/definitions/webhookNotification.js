import PropTypes from 'prop-types';

// Webhook Notification Definition
export default PropTypes.shape({
  // Type of nofitication send (in_stock or out_of_stock)
  type: PropTypes.string.isRequired,

  // The webhook url that was notified
  url: PropTypes.string.isRequired,
});

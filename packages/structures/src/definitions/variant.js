import PropTypes from 'prop-types';

// Variant Info Definition
export default PropTypes.shape({
  // Id of this variant
  id: PropTypes.string.isRequired,

  // Size associated with this variant
  size: PropTypes.string.isRequired,
});

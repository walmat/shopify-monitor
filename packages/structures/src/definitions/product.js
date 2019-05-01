import PropTypes from 'prop-types';

import variant from './variant';

// Product Definition
export default PropTypes.shape({
  // Id of this product object
  id: PropTypes.string.isRequired,

  // Url to the product page
  url: PropTypes.string.isRequired,

  // Base site for this product
  site: PropTypes.string.isRequired,

  // Name of product
  name: PropTypes.string.isRequired,

  // Url of product image
  image: PropTypes.string.isRequired,

  // Variants of this product
  variants: PropTypes.arrayOf(variant).isRequired,

  // Price of this product
  price: PropTypes.string.isRequired,

  // Timestamp when this product was matched
  timestamp: PropTypes.string.isRequired,
});

import PropTypes from 'prop-types';

// Keyword Info Definition
export default PropTypes.shape({
  // Positive keywords: all keywords in this list _must_ be included in matched products
  positive: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Negative keywrods: all keywords in this list _must not_ be included in matched products
  negative: PropTypes.arrayOf(PropTypes.string).isRequired,
  // String representation of keywords formatted as follows:
  // Each positive keyword will be formatted as: "+<keyword>"
  // Each negative keyword will be formatted as: "-<keyword>"
  // combine all formatted keywords in a comma separated list: "<formatted_keyword>,<formatted_keyword>,..."
  value: PropTypes.string.isRequired,
});

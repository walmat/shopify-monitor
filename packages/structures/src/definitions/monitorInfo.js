import PropTypes from 'prop-types';

import site from './site';
import product from './product';
import keywordInfo from './keywordInfo';

// Monitor Info Definition
export default PropTypes.shape({
  // Id of this monitor info object
  id: PropTypes.string.isRequired,

  // Order in which this site should appear when it is a part of a list
  // NOTE: Optional
  index: PropTypes.number,

  // Site information to monitor
  site: site.isRequired,

  // Keywords to match when monitoring
  keywords: keywordInfo.isRequired,

  // The last status message associated with this monitor info
  // NOTE: could be undefined
  status: PropTypes.string,

  // Delay (in ms) to wait between monitor cycles
  monitorDelay: PropTypes.number.isRequired,

  // Delay (in ms) to wait when error occurs in monitor cycles
  errorDelay: PropTypes.number.isRequired,

  // Array of products that are found for that monitor package
  // TODO: find a way to sync this with the database when starting/stopping monitors
  products: PropTypes.arrayOf(product).isRequired,

  // Array of webhooks that should be notified when matched products change
  webhooks: PropTypes.arrayOf(site).isRequired,
});

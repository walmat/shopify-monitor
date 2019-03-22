import PropTypes from 'prop-types';
import proxies from './proxies';
import proxyErrors from './proxyErrors';

export const initialSettingState = {
  proxies: [],
  errorDelay: 1500,
  monitorDelay: 1500,
};

const settings = PropTypes.shape({
  proxies,
  proxyErrors,
  monitordelay: PropTypes.number,
  errorDelay: PropTypes.number,
});

export default settings;

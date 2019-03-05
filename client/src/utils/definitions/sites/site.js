import PropTypes from 'prop-types';

import { initialSettingsStates } from '../settingsDefintions';

export const initialSiteState = {
  id: '',
  index: 0,
  site: {
    name: null,
    url: null,
  },
  keywords: {
    positive: [],
    negative: [],
  },
  status: 'idle',
  errorDelay: initialSettingsStates.errorDelay,
  monitorDelay: initialSettingsStates.monitorDelay,
};

const site = PropTypes.shape({
  id: PropTypes.string,
  index: PropTypes.number,
  site: PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
  }),
  keywords: PropTypes.shape({
    positive: PropTypes.arrayOf(PropTypes.string),
    negative: PropTypes.arrayOf(PropTypes.string),
  }),
  status: PropTypes.string,
  monitordelay: PropTypes.number,
  errorDelay: PropTypes.number,
});

export default site;

import PropTypes from 'prop-types';

export const initialSettingState = {
  errorDelay: 1500,
  monitorDelay: 1500,
};

const settings = PropTypes.shape({
  monitordelay: PropTypes.number,
  errorDelay: PropTypes.number,
});

export default settings;

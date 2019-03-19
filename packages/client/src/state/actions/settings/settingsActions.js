import makeActionCreator from '../actionCreator';

// Top level Actions
export const SETTINGS_ACTIONS = {
  EDIT: 'EDIT_SETTINGS',
};

const editSettings = makeActionCreator(SETTINGS_ACTIONS.EDIT, 'field', 'value');

export const settingsActions = {
  edit: editSettings,
};

// Field Edits
export const SETTINGS_FIELDS = {
  EDIT_ERROR_DELAY: 'EDIT_ERROR_DELAY',
  EDIT_MONITOR_DELAY: 'EDIT_MONITOR_DELAY',
};

export const mapSettingsFieldToKey = {
  [SETTINGS_FIELDS.EDIT_MONITOR_DELAY]: 'monitorDelay',
  [SETTINGS_FIELDS.EDIT_ERROR_DELAY]: 'errorDelay',
};

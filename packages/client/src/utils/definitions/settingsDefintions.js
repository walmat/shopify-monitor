import settings, { initialSettingState } from './settings/settings';
import proxies, { initialProxiesState } from './settings/proxies';
import proxyErrors from './settings/proxyErrors';

export const initialSettingsStates = {
  settings: initialSettingState,
  proxies: initialProxiesState,
  proxyErrors: [],
};

export default {
  settings,
  proxies,
  proxyErrors,
};

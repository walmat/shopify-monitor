import site, { initialSiteState } from './sites/site';
import siteList, { initialSiteListState } from './sites/siteList';

export const initialSitesStates = {
  site: initialSiteState,
  list: initialSiteListState,
};

export default {
  site,
  siteList,
};

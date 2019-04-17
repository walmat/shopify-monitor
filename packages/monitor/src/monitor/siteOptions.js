const sites = [
  {
    name: 'DSM US',
    url: 'https://eflash-us.doverstreetmarket.com',
  },
  {
    name: 'DSM UK',
    url: 'https://eflash.doverstreetmarket.com',
  },
  {
    name: 'DSM SG',
    url: 'https://eflash-sg.doverstreetmarket.com',
  },
  {
    name: 'DSM JP',
    url: 'https://eflash-jp.doverstreetmarket.com',
  },
  {
    name: 'Yeezy Supply',
    url: 'https://yeezysupply.com',
  },
  {
    name: 'Yeezy Supply (Asia)',
    url: 'https://yeezysupply.com',
  },
  {
    name: 'Yeezy Supply (Europe)',
    url: 'https://europe.yeezysupply.com',
  },
  {
    name: 'Yeezy Supply 350',
    url: 'https://350.yeezysupply.com',
  },
  {
    name: 'Yeezy Supply 700',
    url: 'https://700.yeezysupply.com',
  },
];

function isSpecialSite(site) {
  return !!sites.find(s => s.name === site.name || s.url === site.url);
}

module.exports = {
  specialSites: sites,
  isSpecialSite,
};

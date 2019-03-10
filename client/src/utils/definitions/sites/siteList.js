import PropTypes from 'prop-types';

import site from './site';

export const initialSiteListState = [
    {
        id: 1,
        index: 1,
        name: 'Kith',
        url: 'https://kith.com',
        keywords: {
            positive: ['this', 'that'],
            negative: ['not this'],
        },
        status: 'idle',
        errorDelay: 1500,
        monitorDelay: 1500,
    }
];

const siteList = PropTypes.arrayOf(site);

export default siteList;

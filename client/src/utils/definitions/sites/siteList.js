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
    },
    {
        id: 2,
        index: 2,
        name: 'Kith',
        url: 'https://kith.com',
        keywords: {
            positive: ['this', 'that'],
            negative: ['not this'],
        },
        status: 'idle',
        errorDelay: 1500,
        monitorDelay: 1500,
    },
    {
        id: 3,
        index: 3,
        name: 'Kith',
        url: 'https://kith.com',
        keywords: {
            positive: ['this', 'that'],
            negative: ['not this'],
        },
        status: 'idle',
        errorDelay: 1500,
        monitorDelay: 1500,
    },
    {
        id: 4,
        index: 4,
        name: 'Kith',
        url: 'https://kith.com',
        keywords: {
            positive: ['this', 'that'],
            negative: ['not this'],
        },
        status: 'idle',
        errorDelay: 1500,
        monitorDelay: 1500,
    },
    {
        id: 5,
        index: 5,
        name: 'Kith',
        url: 'https://kith.com',
        keywords: {
            positive: ['this', 'that'],
            negative: ['not this'],
        },
        status: 'idle',
        errorDelay: 1500,
        monitorDelay: 1500,
    },
    {
        id: 6,
        index: 6,
        name: 'Kith',
        url: 'https://kith.com',
        keywords: {
            positive: ['this', 'that'],
            negative: ['not this'],
        },
        status: 'idle',
        errorDelay: 1500,
        monitorDelay: 1500,
    },
    {
        id: 7,
        index: 7,
        name: 'Kith',
        url: 'https://kith.com',
        keywords: {
            positive: ['this', 'that'],
            negative: ['not this'],
        },
        status: 'idle',
        errorDelay: 1500,
        monitorDelay: 1500,
    },
    {
        id: 8,
        index: 8,
        name: 'Kith',
        url: 'https://kith.com',
        keywords: {
            positive: ['this', 'that'],
            negative: ['not this'],
        },
        status: 'idle',
        errorDelay: 1500,
        monitorDelay: 1500,
    },
    {
        id: 9,
        index: 9,
        name: 'Kith',
        url: 'https://kith.com',
        keywords: {
            positive: ['this', 'that'],
            negative: ['not this'],
        },
        status: 'idle',
        errorDelay: 1500,
        monitorDelay: 1500,
    },
    {
        id: 10,
        index: 10,
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

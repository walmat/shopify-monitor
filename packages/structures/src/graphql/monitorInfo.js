import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import { SiteType, SiteInputType } from './site';
import {
  KeywordInfoType,
  KeywordInfoDataInputType,
  KeywordInfoStringInputType,
} from './keywordInfo';

export const MonitorInfoType = new GraphQLObjectType({
  name: 'MonitorInfo',
  description: 'Info required to monitor',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Id of MonitorInfo object',
    },
    index: {
      type: GraphQLInt,
      description: 'Optional index used when displaying list of MonitorInfo objects',
    },
    site: {
      type: GraphQLNonNull(SiteType),
      description: 'Site to monitor',
    },
    keywords: {
      type: GraphQLNonNull(KeywordInfoType),
      description: 'KeywordInfo to use as match criteria',
    },
    status: {
      type: GraphQLString,
      description: 'Last monitor status message associated for this MonitorInfo',
    },
    monitorDelay: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'delay (in ms) to wait between monitor cycles',
    },
    errorDelay: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'delay (in ms) to wait when error occurs in monitor cycles',
    },
  }),
});

export const MonitorInfoInputType = new GraphQLInputObjectType({
  name: 'MonitorInfoInput',
  description: 'Input data to create/edit a MonitorInfo object',
  fields: () => ({
    index: {
      type: GraphQLInt,
      description: 'Optional index used when displaying list of MonitorInfo objects',
    },
    site: {
      type: SiteInputType,
      description: 'Site to monitor',
    },
    keywords: {
      type: KeywordInfoDataInputType,
      description: 'KeywordInfo to use as match criteria',
    },
    keywordsRaw: {
      type: KeywordInfoStringInputType,
      description: 'KeywordInfo to use as match criteria (raw string)',
    },
    status: {
      type: GraphQLString,
      description: 'Last monitor status message associated for this MonitorInfo',
    },
    monitorDelay: {
      type: GraphQLInt,
      description: 'delay (in ms) to wait between monitor cycles',
    },
    errorDelay: {
      type: GraphQLInt,
      description: 'delay (in ms) to wait when error occurs in monitor cycles',
    },
  }),
});
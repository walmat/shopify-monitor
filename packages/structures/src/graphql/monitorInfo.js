import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLNumber,
} from 'graphql';

import { SiteType, SiteInputType } from './site';
import { KeywordInfoType, KeywordInfoInputType } from './keywordInfo';

export const monitorInfo = new GraphQLObjectType({
  name: 'MonitorInfo',
  description: 'Info required to monitor',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Id of MonitorInfo object',
    },
    index: {
      type: GraphQLNumber,
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
      type: GraphQLNonNull(GraphQLNumber),
      description: 'delay (in ms) to wait between monitor cycles',
    },
    errorDelay: {
      type: GraphQLNonNull(GraphQLNumber),
      description: 'delay (in ms) to wait when error occurs in monitor cycles',
    },
  }),
});

export const monitorInfoInput = new GraphQLInputObjectType({
  name: 'MonitorInfoInput',
  description: 'Input data to create/edit a MonitorInfo object',
  fields: () => ({
    index: {
      type: GraphQLNumber,
      description: 'Optional index used when displaying list of MonitorInfo objects',
    },
    site: {
      type: SiteInputType,
      description: 'Site to monitor',
    },
    keywords: {
      type: KeywordInfoInputType,
      description: 'KeywordInfo to use as match criteria',
    },
    status: {
      type: GraphQLString,
      description: 'Last monitor status message associated for this MonitorInfo',
    },
    monitorDelay: {
      type: GraphQLNumber,
      description: 'delay (in ms) to wait between monitor cycles',
    },
    errorDelay: {
      type: GraphQLNumber,
      description: 'delay (in ms) to wait when error occurs in monitor cycles',
    },
  }),
});

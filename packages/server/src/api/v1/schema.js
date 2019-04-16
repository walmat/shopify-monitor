import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
} from 'graphql';

import * as structures from '@monitor/structures';

const {
  graphql: { MonitorInfoType, ProxyType, SettingsType, SiteType },
} = structures;

const {
  initialStates: { monitorInfoState, proxyState, settingsState, siteState },
} = structures;

const query = new GraphQLObjectType({
  name: 'QueryAPI',
  description: 'Query API for Shopify Monitor',
  fields: () => ({
    proxies: {
      type: GraphQLList(GraphQLNonNull(ProxyType)),
      description: 'Retrieve all proxies',
      resolve: () => [], // TODO: Implement
    },
    proxy: {
      type: ProxyType,
      description: 'Retrieve proxy for a specific id',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of the proxy to retrieve',
        },
      },
      resolve: () => ({ ...proxyState }), // TODO: Impelement
    },
    settings: {
      type: GraphQLNonNull(SettingsType),
      description: 'Retrieve settings',
      resolve: () => ({ ...settingsState }), // TODO: Implement
    },
    webhooks: {
      type: GraphQLList(GraphQLNonNull(SiteType)),
      description: 'Retrieve stored webhooks',
      resolve: () => [], // TODO: Implement
    },
    webhook: {
      type: GraphQLNonNull(SiteType),
      description: 'Retrieve webhook for specific id',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of webhook to retrieve',
        },
      },
      resolve: () => ({ ...siteState }), // TODO: Implement
    },
    monitors: {
      type: GraphQLList(GraphQLNonNull(MonitorInfoType)),
      description: 'Retrieve all Monitors',
      resolve: () => [],
    },
    monitor: {
      type: GraphQLNonNull(MonitorInfoType),
      description: 'Retrieve monitor for specific id',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of monitor to retrieve',
        },
      },
      resolve: () => ({ ...monitorInfoState }), // TODO: Implement
    },
  }),
});

const schema = new GraphQLSchema({
  query,
  types: [MonitorInfoType, SiteType, SettingsType, ProxyType],
});

export default schema;

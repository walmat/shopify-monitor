import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
} from 'graphql';

import * as structures from '@monitor/structures';

const {
  graphql: {
    MonitorInfoType,
    MonitorInfoInputType,
    ProxyType,
    ProxyStringInputType,
    ProxyDataInputType,
    SettingsType,
    SettingsInputType,
    SiteType,
    SiteInputType,
  },
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

const mutation = new GraphQLObjectType({
  name: 'MutationAPI',
  description: 'Mutation API for Shopify Monitor',
  fields: () => ({
    addProxyFromString: {
      type: ProxyType,
      description: 'Add a new proxy from a raw string input',
      args: {
        data: {
          type: GraphQLNonNull(ProxyStringInputType),
          description: 'String to parse for proxy data',
        },
      },
      resolve: () => ({ ...proxyState }), // TODO: Implement
    },
    addProxyFromData: {
      type: ProxyType,
      description: 'Add a new proxy from structured data',
      args: {
        data: {
          type: GraphQLNonNull(ProxyDataInputType),
          description: 'Structured data for proxy',
        },
      },
      resolve: () => ({ ...proxyState }), // TODO: Implement
    },
    editProxyFromString: {
      type: ProxyType,
      description: 'Edit an existing proxy using a raw string input',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of proxy to edit',
        },
        data: {
          type: GraphQLNonNull(ProxyStringInputType),
          description: 'String to parse for proxy data',
        },
      },
      resolve: () => ({ ...proxyState }), // TODO: Implement
    },
    editProxyFromData: {
      type: ProxyType,
      description: 'Edit an existing proxy using structured data',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of proxy to edit',
        },
        data: {
          type: GraphQLNonNull(ProxyDataInputType),
          description: 'Structured data for proxy',
        },
      },
      resolve: () => ({ ...proxyState }), // TODO: Implement
    },
    updateSettings: {
      type: SettingsType,
      description: 'Update the saved settings',
      args: {
        data: {
          type: GraphQLNonNull(SettingsInputType),
          description: 'Updated settings to save',
        },
      },
      resolve: () => ({ ...settingsState }), // TODO: Implement
    },
    addWebhook: {
      type: SiteType,
      description: 'Add a new webhook',
      args: {
        data: {
          type: GraphQLNonNull(SiteInputType),
          description: 'webhook info to add',
        },
      },
      resolve: () => ({ ...siteState }), // TODO: Implement
    },
    editWebhook: {
      type: SiteType,
      description: 'edit an existing webhook',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of webhook to update',
        },
        data: {
          type: GraphQLNonNull(SiteInputType),
          description: 'updated webhook info',
        },
      },
      resolve: () => ({ ...siteState }), // TODO: Implement
    },
    addMonitor: {
      type: MonitorInfoType,
      description: 'Add a new Monitor',
      args: {
        data: {
          type: GraphQLNonNull(MonitorInfoInputType),
          description: 'Monitor Info to add',
        },
      },
      resolve: () => ({ ...monitorInfoState }), // TODO: Implement
    },
    editMonitor: {
      type: MonitorInfoType,
      description: 'Edit an existing Monitor',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of monitor to edit',
        },
        data: {
          type: GraphQLNonNull(MonitorInfoInputType),
          description: 'Updated monitor info',
        },
      },
      resolve: () => ({ ...monitorInfoState }), // TODO: Implement
    },
  }),
});

const schema = new GraphQLSchema({
  query,
  mutation,
  types: [MonitorInfoType, SiteType, SettingsType, ProxyType],
});

export default schema;

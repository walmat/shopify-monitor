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
    ProductType,
    ProductInputType,
    ProxyType,
    ProxyStringInputType,
    ProxyDataInputType,
    SettingsType,
    SettingsInputType,
    SiteType,
    SiteInputType,
    WebhookGroupType,
    WebhookGroupInputType,
  },
} = structures;

const query = new GraphQLObjectType({
  name: 'QueryAPI',
  description: 'Query API for Shopify Monitor',
  fields: () => ({
    products: {
      type: GraphQLList(GraphQLNonNull(ProductType)),
      description: 'Retrieve all matched products',
      resolve: root => root.browseProducts(),
    },
    product: {
      type: ProductType,
      description: 'Retrieve matched product for a specific id',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of product to retrieve',
        },
      },
      resolve: (root, { id }) => root.readProduct(id),
    },
    proxies: {
      type: GraphQLList(GraphQLNonNull(ProxyType)),
      description: 'Retrieve all proxies',
      resolve: root => root.browseProxies(),
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
      resolve: (root, { id }) => root.readProxy(id),
    },
    settings: {
      type: GraphQLNonNull(SettingsType),
      description: 'Retrieve settings',
      resolve: root => root.getSettings(),
    },
    webhookGroups: {
      type: GraphQLList(GraphQLNonNull(WebhookGroupType)),
      description: 'Retrieve stored webhook groups',
      resolve: root => root.browseWebhookGroups(),
    },
    webhookGroup: {
      type: WebhookGroupType,
      description: 'Retrieve webhook group for specific id',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of webhook group to retrieve',
        },
      },
      resolve: (root, { id }) => root.readWebhookGroup(id),
    },
    webhooks: {
      type: GraphQLList(GraphQLNonNull(SiteType)),
      description: 'Retrieve stored webhooks from all groups',
      resolve: root => root.browseWebhooks(),
    },
    webhook: {
      type: GraphQLNonNull(SiteType),
      description: 'Retrieve webhook for specific id',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of webhook to retrieve',
        },
        groupId: {
          type: GraphQLString,
          description: 'id of group to narrow down search (Optional)',
        },
        groupName: {
          type: GraphQLString,
          description: 'name of group to narrow down search (Optional)',
        },
      },
      resolve: (root, { id, groupId, groupName }) => root.readWebhook(id, groupId, groupName),
    },
    monitors: {
      type: GraphQLList(GraphQLNonNull(MonitorInfoType)),
      description: 'Retrieve all Monitors',
      resolve: root => root.browseMonitors(),
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
      resolve: (root, { id }) => root.readMonitor(id),
    },
  }),
});

const mutation = new GraphQLObjectType({
  name: 'MutationAPI',
  description: 'Mutation API for Shopify Monitor',
  fields: () => ({
    addProduct: {
      type: ProductType,
      description: 'Add a new product',
      args: {
        data: {
          type: GraphQLNonNull(ProductInputType),
          description: 'Product data to store',
        },
      },
      resolve: (root, { data }) => root.addProduct(data),
    },
    editProduct: {
      type: ProductType,
      description: 'Edit an existing product with new data',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of product to edit',
        },
        data: {
          type: GraphQLNonNull(ProductInputType),
          description: 'Product data to store',
        },
      },
      resolve: (root, { id, data }) => root.editProduct(id, data),
    },
    addProxyFromString: {
      type: ProxyType,
      description: 'Add a new proxy from a raw string input',
      args: {
        data: {
          type: GraphQLNonNull(ProxyStringInputType),
          description: 'String to parse for proxy data',
        },
      },
      resolve: (root, { data }) => root.addProxyFromString(data),
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
      resolve: (root, { data }) => root.addProxyFromData(data),
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
      resolve: (root, { id, data }) => root.editProxyFromString(id, data),
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
      resolve: (root, { id, data }) => root.editProxyFromData(id, data),
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
      resolve: (root, { data }) => root.updateSettings(data),
    },
    addWebhookGroup: {
      type: WebhookGroupType,
      description: 'Add a new webhook group',
      args: {
        data: {
          type: GraphQLNonNull(WebhookGroupInputType),
          description: 'Webhook group info to add',
        },
      },
      resolve: (root, { data }) => root.addWebhookGroup(data),
    },
    editWebhookGroup: {
      type: WebhookGroupType,
      description: 'Edit an existing webhook group',
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
          description: 'id of webhook group to update',
        },
        data: {
          type: GraphQLNonNull(WebhookGroupInputType),
          description: 'Webhook group info to update',
        },
      },
      resolve: (root, { id, data }) => root.editWebhookGroup(id, data),
    },
    addWebhook: {
      type: SiteType,
      description: 'Add a new webhook',
      args: {
        data: {
          type: GraphQLNonNull(SiteInputType),
          description: 'webhook info to add',
        },
        groupId: {
          type: GraphQLNonNull(GraphQLString),
          description: 'webhook group to associate with the webhook',
        },
      },
      resolve: (root, { data, groupId }) => root.addWebhook(data, groupId),
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
        groupId: {
          type: GraphQLNonNull(GraphQLString),
          description: 'webhook group associated with webhook',
        },
      },
      resolve: (root, { id, data, groupId }) => root.editWebhook(id, data, groupId),
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
      resolve: (root, { data }) => root.addMonitor(data),
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
      resolve: (root, { id, data }) => root.editMonitor(id, data),
    },
  }),
});

const schema = new GraphQLSchema({
  query,
  mutation,
  types: [MonitorInfoType, SiteType, SettingsType, ProxyType],
});

export default schema;

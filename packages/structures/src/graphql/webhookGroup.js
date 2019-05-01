import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';

import { SiteType, SiteInputType } from './site';

export const WebhookGroupType = new GraphQLObjectType({
  name: 'WebhookGroup',
  description: 'Group of related webhooks',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The id of the webhook group',
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the webhook group (for display purposes)',
    },
    webhooks: {
      type: GraphQLNonNull(GraphQLList(SiteType)),
      description: 'List of webhooks in the group',
    },
  }),
});

export const WebhookGroupInputType = new GraphQLInputObjectType({
  name: 'WebhookGroupInput',
  description: 'Input data to create/edit a Webhook Group',
  fields: () => ({
    name: {
      type: GraphQLString,
      description: 'The name of the webhook group (for display purposes)',
    },
    webhooks: {
      type: GraphQLList(SiteInputType),
      description: 'List of webhooks in the group',
    },
  }),
});

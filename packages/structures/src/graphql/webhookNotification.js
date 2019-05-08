import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLInputObjectType } from 'graphql';

export const WebhookNotificationType = new GraphQLObjectType({
  name: 'WebhookNotification',
  description: 'Metadata associated with a webhook notification',
  fields: () => ({
    type: {
      type: GraphQLNonNull(GraphQLString),
      description: 'type of notification (in_stock or out_of_stock)',
    },
    url: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Webhook url that was notified',
    },
  }),
});

export const WebhookNotificationInputType = new GraphQLInputObjectType({
  name: 'WebhookNotificationInput',
  description: 'Input data to create/edit a WebhookNotification',
  fields: () => ({
    type: {
      type: GraphQLString,
      description: 'type of notification (in_stock or out_of_stock)',
    },
    url: {
      type: GraphQLString,
      description: 'Webhook url that was notified',
    },
  }),
});

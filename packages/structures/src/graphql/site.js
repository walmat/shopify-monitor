import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLInputObjectType } from 'graphql';

export const SiteType = new GraphQLObjectType({
  name: 'Site',
  description: 'Site to monitor',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The id of the site',
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the site (for display purposes only)',
    },
    url: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The url of the site (for monitor purposes)',
    },
  }),
});

export const SiteInputType = new GraphQLInputObjectType({
  name: 'SiteInput',
  description: 'Input data to create/edit a Site',
  fields: () => ({
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the site (for display purposes only)',
    },
    url: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The url of the site (for monitor purposes)',
    },
  }),
});

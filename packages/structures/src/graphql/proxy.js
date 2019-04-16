import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';

export const ProxyType = new GraphQLObjectType({
  name: 'Proxy',
  description: 'Proxy information that can be used when monitoring',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Id of the Proxy',
    },
    requiresAuth: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'Flag to tell if Proxy requires authentication',
    },
    username: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Username for Proxy authentication',
    },
    password: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Password for Proxy authentication',
    },
    hostname: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Domain or ip part of the Proxy',
    },
    port: {
      type: GraphQLNonNull(GraphQLString),
      description: 'port part of the Proxy',
    },
    value: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Formatted string representation of Proxy',
    },
  }),
});

export const ProxyDataInputType = new GraphQLInputObjectType({
  name: 'ProxyDataInput',
  description: 'Input data to create/edit a Proxy',
  fields: () => ({
    requiresAuth: {
      type: GraphQLBoolean,
      description: 'Flag to tell if Proxy requires authentication',
    },
    username: {
      type: GraphQLString,
      description: 'Username for Proxy authentication',
    },
    password: {
      type: GraphQLString,
      description: 'Password for Proxy authentication',
    },
    hostname: {
      type: GraphQLString,
      description: 'Domain or ip part of the Proxy',
    },
    port: {
      type: GraphQLString,
      description: 'port part of the Proxy',
    },
  }),
});

export const ProxyStringInputType = new GraphQLInputObjectType({
  name: 'ProxyStringInput',
  description: 'Input string to parse when creating/editing a Proxy',
  fields: () => ({
    value: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Formatted string representation of Proxy',
    },
  }),
});

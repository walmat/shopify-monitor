import { GraphQLNumber, GraphQLNonNull, GraphQLObjectType, GraphQLInputObjectType } from 'graphql';

export const SettingsType = new GraphQLObjectType({
  name: 'Settings',
  description: 'Settings for the monitor',
  fields: () => ({
    defaultErrorDelay: {
      type: GraphQLNonNull(GraphQLNumber),
      description: 'Default error delay when monitoring',
    },
    defaultMonitorDelay: {
      type: GraphQLNonNull(GraphQLNumber),
      description: 'Default monitor delay when monitoring',
    },
  }),
});

export const SettingsInputType = new GraphQLInputObjectType({
  name: 'SettingsInput',
  description: 'Input data to update Settings',
  fields: () => ({
    defaultErrorDelay: {
      type: GraphQLNonNull(GraphQLNumber),
      description: 'Default error delay when monitoring',
    },
    defaultMonitorDelay: {
      type: GraphQLNonNull(GraphQLNumber),
      description: 'Default monitor delay when monitoring',
    },
  }),
});

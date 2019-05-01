import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLInputObjectType } from 'graphql';

export const VariantType = new GraphQLObjectType({
  name: 'Variant',
  description: 'Variant of a product',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The id of the variant',
    },
    size: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The size associated with the variant',
    },
  }),
});

export const VariantInputType = new GraphQLInputObjectType({
  name: 'VariantInput',
  description: 'Input data to create/edit a Variant',
  fields: () => ({
    id: {
      type: GraphQLString,
      description: 'The id of the variant',
    },
    size: {
      type: GraphQLString,
      description: 'The size associated with the variant',
    },
  }),
});

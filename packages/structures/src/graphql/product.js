import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';

import { VariantType, VariantInputType } from './variant';

export const ProductType = new GraphQLObjectType({
  name: 'Product',
  description: 'Product info that has been matched by a monitor',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The id of the product',
    },
    url: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The url to the product page',
    },
    site: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The base site for the product',
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The name of the product',
    },
    image: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The url of the product image',
    },
    variants: {
      type: GraphQLNonNull(GraphQLList(VariantType)),
      description: 'Variants of the product',
    },
    price: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Price of the product',
    },
    timestamp: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Timestamp when this product was matched',
    },
  }),
});

export const ProductInputType = new GraphQLInputObjectType({
  name: 'ProductInput',
  description: 'Input data to create/edit a Product',
  fields: () => ({
    url: {
      type: GraphQLString,
      description: 'The url to the product page',
    },
    site: {
      type: GraphQLString,
      description: 'The base site for the product',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the product',
    },
    image: {
      type: GraphQLString,
      description: 'The url of the product image',
    },
    variants: {
      type: GraphQLList(VariantInputType),
      description: 'Variants of the product',
    },
    price: {
      type: GraphQLString,
      description: 'Price of the product',
    },
    timestamp: {
      type: GraphQLString,
      description: 'Timestamp when this product was matched',
    },
  }),
});

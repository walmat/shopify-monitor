import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLUnionType,
} from 'graphql';

export const KeywordInfoType = new GraphQLObjectType({
  name: 'KeywordInfo',
  description: 'Keyword info to use as matching criteria for monitor',
  fields: () => ({
    positive: {
      type: GraphQLList(GraphQLNonNull(GraphQLString)),
      description: 'Keywords that must be included in product for a successful match',
    },
    negative: {
      type: GraphQLList(GraphQLNonNull(GraphQLString)),
      description: 'Keywords that must not be included in product for a successful match',
    },
    value: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Formatted string representation for keywords',
    },
  }),
});

export const KeywordInfoDataInputType = new GraphQLInputObjectType({
  name: 'KeywordInfoDataInput',
  description: 'Input data to create/edit a KeywordInfo',
  fields: () => ({
    positive: {
      type: GraphQLList(GraphQLNonNull(GraphQLString)),
      description: 'Keywords that must be included in product for a successful match',
    },
    negative: {
      type: GraphQLList(GraphQLNonNull(GraphQLString)),
      description: 'Keywords that must not be included in product for a successful match',
    },
  }),
});

export const KeywordInfoStringInputType = new GraphQLInputObjectType({
  name: 'KeywordInfoStringInput',
  description: 'Input string to parse when creating/editing a KeywordInfo',
  fields: () => ({
    value: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Formatted string representation for keywords',
    },
  }),
});

export const KeywordInfoInputType = new GraphQLUnionType({
  name: 'KeywordInfoInput',
  description: 'Union of data/string types for creating/editing a KeywordInfo',
  types: [KeywordInfoDataInputType, KeywordInfoStringInputType],
  resolveType: input => {
    if (input.positive && input.negative) {
      return KeywordInfoDataInputType;
    }
    return KeywordInfoStringInputType;
  },
});

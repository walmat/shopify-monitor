import { graphql, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

class MutationSchemaTester {
  constructor(type, baseState, returnType, queryOverrides = {}) {
    this._type = type;
    this._returnType = returnType;
    this._baseState = baseState;
    this._queryOverrides = queryOverrides;
    this._keys = Object.keys(baseState);
    const query = new GraphQLObjectType({
      name: 'queryplaceholder',
      fields: () => ({
        placeholder: {
          type: GraphQLString,
          resolve: () => 'placeholder',
        },
      }),
    });
    const mutation = new GraphQLObjectType({
      name: 'test',
      fields: () => ({
        mutate: {
          type: returnType,
          args: {
            data: {
              type,
            },
          },
          resolve: () => baseState,
        },
      }),
    });
    this._schema = new GraphQLSchema({
      query,
      mutation,
      types: [returnType, type],
    });

    this.buildQueryString = this.buildQueryString.bind(this);
    this.generateTestForKey = this.generateTestForKey.bind(this);
    this.generateTestsForKey = this.generateTestsForKey.bind(this);
  }

  buildQueryString() {
    const props = [];
    this._keys.forEach(key => {
      if (this._queryOverrides[key] !== null) {
        props.push(this._queryOverrides[key] || key);
      }
    });
    const propString = props.join(',');
    return `mutation M($input: ${this._type}) { mutate(data: $input) { ${propString} } }`;
  }

  generateTestForKey(key, base, value, isValid = true) {
    const status = isValid ? 'pass' : 'fail';
    it(`should ${status} when set to ${value}`, async () => {
      const query = this.buildQueryString();
      const variables = {
        input: {
          ...base,
          [key]: value,
        },
      };
      const result = await graphql(this._schema, query, {}, null, variables);
      if (isValid) {
        expect(result.errors).toBeUndefined();
        expect(result.data.mutate).toBeDefined();
      } else {
        expect(result.data).toBeUndefined();
        expect(result.errors).toBeDefined();
      }
    });
  }

  generateTestsForKey(key, base, valid = [], invalid = []) {
    describe(`for key: ${key}`, () => {
      valid.forEach(v => this.generateTestForKey(key, base, v));
    });

    describe(`for key: ${key}`, () => {
      invalid.forEach(v => this.generateTestForKey(key, base, v, false));
    });
  }
}

export default MutationSchemaTester;

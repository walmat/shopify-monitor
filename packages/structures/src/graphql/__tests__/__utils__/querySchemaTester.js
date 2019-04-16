import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';

class QuerySchemaTester {
  constructor(type, initialState, queryOverrides = {}) {
    this._initialState = initialState;
    this._queryOverrides = queryOverrides;
    this._keys = Object.keys(initialState);
    this._query = new GraphQLObjectType({
      name: 'test',
      fields: () => ({
        payload: {
          type,
          resolve: root => root.payload,
        },
      }),
    });
    this._schema = new GraphQLSchema({
      query: this._query,
      types: [type],
    });

    this.generateMissingKeyTest = this.generateMissingKeyTest.bind(this);
    this.generatePartialQueryTest = this.generatePartialQueryTest.bind(this);
    this.generateTestSuite = this.generateTestSuite.bind(this);
  }

  buildQueryString({ exclude } = { exclude: [] }) {
    const props = [];
    this._keys.forEach(key => {
      if (!exclude.includes(key)) {
        props.push(this._queryOverrides[key] || key);
      }
    });
    const propString = props.join(',');
    return `query Q { payload { ${propString} } }`;
  }

  runQuery(queryString, rootValue) {
    return graphql(this._schema, queryString, rootValue);
  }

  generatePartialQueryTest(key, initialState) {
    test(`when ${key} is omitted from query`, async () => {
      const root = {
        payload: { ...initialState },
      };
      const expectedPayload = { ...initialState };
      delete expectedPayload[key];

      const queryString = this.buildQueryString({ exclude: [key] });
      const result = await this.runQuery(queryString, root);
      expect(result.errors).toBeUndefined();
      expect(result.data.payload).toEqual(expectedPayload);
    });

    test(`when ${key} is omitted from query and removed from payload`, async () => {
      const root = {
        payload: { ...initialState },
      };
      const expectedPayload = { ...initialState };
      delete expectedPayload[key];

      const queryString = this.buildQueryString({ exclude: [key] });
      const result = await this.runQuery(queryString, root);
      expect(result.errors).toBeUndefined();
      expect(result.data.payload).toEqual(expectedPayload);
    });
  }

  generateMissingKeyTest(key, initialState) {
    test(`when ${key} is missing and is included in query`, async () => {
      const root = {
        payload: { ...initialState },
      };
      delete root.payload[key];
      const queryString = this.buildQueryString();
      const result = await this.runQuery(queryString, root);
      expect(result.errors).toBeDefined();
      expect(result.data.payload).toBeNull();
    });
  }

  generateTestSuite() {
    it('should treat initial state as valid', async () => {
      const root = {
        payload: { ...this._initialState },
      };
      const queryString = this.buildQueryString();
      const result = await this.runQuery(queryString, root);
      expect(result.errors).toBeUndefined();
      expect(result.data.payload).toEqual(this._initialState);
    });

    describe('should return payload', () => {
      this._keys.forEach(k => this.generatePartialQueryTest(k, this._initialState));
    });

    describe('should throw error', () => {
      this._keys.forEach(k => this.generateMissingKeyTest(k, this._root));
    });
  }
}

export default QuerySchemaTester;

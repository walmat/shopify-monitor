import graphqlHTTP from 'express-graphql';

import DataSchema from './schema';

const attachGraphQLDataRoute = (app, route, root) => {
  app.use(
    route,
    graphqlHTTP({
      schema: DataSchema,
      rootValue: root,
      graphiql: true, // TODO: use a flag to enable/disable this -- should be enabled for development only
    }),
  );
};

export default attachGraphQLDataRoute;

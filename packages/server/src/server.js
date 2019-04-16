import express from 'express';
import cors from 'cors';

import attachV1DataRoute from './api/v1/data';

const app = express();
app.use(cors());
// TODO: Add back in when we have the client setup
// app.use(express.static(path.join(__dirname, '/client/build')));

// Attach the v1 graphql data route
attachV1DataRoute(app, '/api/v1/data', {}); // TODO: add root value

// The "catch all" handler: for any request that doesn't
// match one above, send back React's index.html file.
// TODO: Add back in when we have the client setup
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/client/build/index.html'));
// });

const port = process.env.PORT || 5000;
app.listen(port);

// eslint-disable-next-line no-console
console.log(`server listening on ${port}`);

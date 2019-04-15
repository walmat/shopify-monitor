const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '/client/build')));

app.get('/api/test', (req, res) => {
  res.json({
    message: 'hello world',
  });
});

// The "catch all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`server listening on ${port}`); // eslint-disable-line no-console

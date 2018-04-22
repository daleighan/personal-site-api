const serverless = require('serverless-http');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('hello from lambda');
});

module.exports.handler = serverless(app);

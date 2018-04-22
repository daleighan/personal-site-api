const serverless = require('serverless-http');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('hello from lambda');
});

app.post('/projects', (req, res) => {
  const {name, description} = req.body;
  const params = {
    name,
    description,
  };
  dynamoDb.put((params, err) => {
    if (err) {
      res.json(`Error adding project, ${err}`);
    }
    res.json('Project successfully added');
  });
});

module.exports.handler = serverless(app);

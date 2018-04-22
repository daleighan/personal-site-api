const serverless = require('serverless-http');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const PROJECTS_TABLE = process.env.PROJECTS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('hello from lambda');
});

app.get('/projects', (req, res) => {
  const params = {
    TableName: PROJECTS_TABLE,
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({error});
    }
    res.json(result);
  });
});

app.post('/projects', (req, res) => {
  const {projectName, description} = req.body;
  const params = {
    TableName: PROJECTS_TABLE,
    Item: {
      projectName,
      description,
    },
  };
  dynamoDb.put(params, error => {
    if (error) {
      res.status(400).json({error});
    }
    res.json({projectName, description});
  });
});

module.exports.handler = serverless(app);

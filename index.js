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
      console.log(error);
      res.status(400).json({error: 'Could not create user'});
    }
    res.json({projectName, description});
  });
});

module.exports.handler = serverless(app);

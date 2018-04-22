const serverless = require('serverless-http');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const PROJECTS_TABLE = process.env.PROJECTS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  });
  console.log(dynamoDb);
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

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
      pictures: [],
    },
  };
  dynamoDb.put(params, error => {
    if (error) {
      res.status(400).json({error});
    }
    res.json({projectName, description});
  });
});

app.delete('/projects', (req, res) => {
  const {projectName} = req.body;
  const params = {
    TableName: PROJECTS_TABLE,
    Key: {
      projectName,
    }
  }
  dynamoDb.delete(params, error => {
    if (error) {
      res.status(400).json({error});
    }
    res.json(`Project deleted: ${projectName}`);
  });
});

module.exports.handler = serverless(app);

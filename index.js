const serverless = require('serverless-http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const partials = require('express-partials');
const AWS = require('aws-sdk');
const cookieParser = require('cookie-parser');
const PROJECTS_TABLE = process.env.PROJECTS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const secret = process.env.SECRET || 'shhhhhh';

const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(403).json('Invalid Token');
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(403).json('No Token Provided');
  }
};

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/images', verifyJWT, (req, res) => {
  res.render('upload');
});

app.post('/login', (req, res) => {
  const {username, password} = req.body;
  if (username === 'alexleigh' && password === 'password') {
    const token = jwt.sign({admin: username}, secret);
    res.cookie('jwtToken', token, {maxAge: 900000, httpOnly: true});
    res.redirect('/images');
  } else {
    res.json('invalid credentials');
  }
});

app.get('/projects', verifyJWT, (req, res) => {
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

app.post('/projects', verifyJWT, (req, res) => {
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

app.delete('/projects', verifyJWT, (req, res) => {
  const {projectName} = req.body;
  const params = {
    TableName: PROJECTS_TABLE,
    Key: {
      projectName,
    },
  };
  dynamoDb.delete(params, error => {
    if (error) {
      res.status(400).json({error});
    }
    res.json(`Project deleted: ${projectName}`);
  });
});

module.exports.handler = serverless(app);

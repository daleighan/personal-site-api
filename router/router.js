const router = require('express').Router();
const secret = process.env.SECRET || 'shhhhhh';
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
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

router.get('/', (req, res) => {
  res.send('Welcome to Alex Leigh\'s page');
});

router.post('/login', (req, res) => {
  const {username, password} = req.body;
  if (username === 'alexleigh' && password === 'password') {
    const params = {
      admin: username,
      auth:  'magic',
      agent: req.headers['user-agent'],
      exp:   Math.floor(new Date().getTime()/1000) + 7*24*60*60,
    }
    const token = jwt.sign(params, secret);
    res.cookie('jwtToken', token, {maxAge: 900000, httpOnly: true});
    res.send('here is your cookie');
  } else {
    res.json('invalid credentials');
  }
});

router.get('/projects', verifyJWT, (req, res) => {
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

router.post('/projects', verifyJWT, (req, res) => {
  const params = {
    TableName: PROJECTS_TABLE,
    Item: {
      ...req.body,
      pictures: [],
    },
  };
  dynamoDb.put(params, error => {
    if (error) {
      res.status(400).json({error});
    }
    res.json(params.Item);
  });
});

router.delete('/projects', verifyJWT, (req, res) => {
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

module.exports = router;

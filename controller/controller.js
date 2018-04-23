const jwt = require('jsonwebtoken');
const PROJECTS_TABLE = process.env.PROJECTS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;
const secret = process.env.SECRET;
const AWS = require('aws-sdk');

let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

const root = (req, res) => {
  res.json("Welcome to Alex's API");
};

const login = (req, res) => {
  const {username, password} = req.body;
  if (username === process.env.USERNAME && password === process.env.PASSWORD) {
    const params = {
      admin: username,
      auth: 'magic',
      agent: req.headers['user-agent'],
      exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
    };
    const token = jwt.sign(params, secret);
    res.cookie('jwtToken', token, {maxAge: 900000, httpOnly: true});
    res.send('here is your cookie');
  } else {
    res.json('invalid credentials');
  }
};

const getProjects = (req, res) => {
  const params = {
    TableName: PROJECTS_TABLE,
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({error});
    }
    res.json(result);
  });
};

const addProject = (req, res) => {
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
};

const updateProject = (req, res) => {
  const {projectName} = req.body;
  let UpdateExpression = 'set ';
  let ExpressionAttributeValues = {};
  let attrVal = 'a';
  for (let key in req.body) {
    if (key !== 'projectName') {
      UpdateExpression += `${key} = :${attrVal}, `;
      ExpressionAttributeValues[`:${attrVal}`] = req.body[key];
      attrVal = String.fromCharCode(attrVal.charCodeAt() + 1)
    }  
  }
  UpdateExpression = UpdateExpression.replace(/,\s*$/, '');
  const params = {
    TableName: PROJECTS_TABLE,
    Key: {
      projectName,
    },
    UpdateExpression,
    ExpressionAttributeValues,
    ReturnValues: 'UPDATED_NEW'
  };
  dynamoDb.update(params, (error, data) => {
    if (error) {
      res.status(400).json({error});
    }
    res.json(data);
  });
};

const deleteProject = (req, res) => {
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
};

module.exports = {
  root,
  login,
  getProjects,
  addProject,
  updateProject,
  deleteProject,
};

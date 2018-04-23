const router = require('express').Router();
const jwt = require('jsonwebtoken');
const controller = require('../controller/controller');
const {root, login, getProjects, addProject, deleteProject} = controller;
const secret = process.env.SECRET || 'shhhhhhhhh';

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

router.get('/', root);
router.post('/login', login);
router.get('/projects', verifyJWT, getProjects);
router.post('/projects', verifyJWT, addProject);
router.delete('/projects', verifyJWT, deleteProject);

module.exports = router;

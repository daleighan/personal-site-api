const router = require('express').Router();
const controller = require('../controller/controller');
const {root, login, getProjects, addProject, deleteProject} = controller;
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', root);
router.post('/login', login);
router.get('/projects', verifyJWT, getProjects);
router.post('/projects', verifyJWT, addProject);
router.delete('/projects', verifyJWT, deleteProject);

module.exports = router;

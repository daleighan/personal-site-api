const router = require('express').Router();
const controller = require('../controller/controller');
const {root, login, getProjects, addProject, updateProject, deleteProject} = controller;
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', root);
router.post('/login', login);
router.get('/projects', verifyJWT, getProjects);
router.post('/projects', verifyJWT, addProject);
router.put('/projects', verifyJWT, updateProject);
router.delete('/projects', verifyJWT, deleteProject);

module.exports = router;

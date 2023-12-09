const express = require('express');
const agentController = require('../controllers/agentController.js');

const router = express.Router();

router.post('/add', agentController.addAgent);

router.put('/update/:id', agentController.updateAgent);

router.get('/all/:id', agentController.getAgents);

router.get('/:id', agentController.getAgent);

router.delete('/delete/:id', agentController.deleteAgent);

module.exports = router;
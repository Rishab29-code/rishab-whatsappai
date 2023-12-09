const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController.js');
const { Group } = require('../config.js');

// router.post('/',groupController.createGroup);
router.get('/:id',groupController.getGroup);
router.put('/:id',groupController.updateGroup);
router.delete('/:groupId',groupController.deleteGroup);
router.get('/all/:id',groupController.getGroups);

module.exports = router;
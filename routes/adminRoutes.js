const express = require('express');
const adminController = require('../controllers/adminController.js');

const router = express.Router();

router.put('/update/:id', adminController.updateAdmin);

router.get('/:id',adminController.getAdmin);

module.exports = router;
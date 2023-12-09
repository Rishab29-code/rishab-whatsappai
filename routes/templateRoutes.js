const express = require('express');
const templateController = require('../controllers/templateController.js');

const router = express.Router();

router.post('/',templateController.createTemplate);

router.post('/chatbot',templateController.createChatbotTemplate);
router.get('/all/:id',templateController.getTemplates);
router.get('/:id',templateController.getTemplate);
router.put('/:id',templateController.updateTemplate);
router.delete('/:id',templateController.deleteTemplate);

module.exports = router;
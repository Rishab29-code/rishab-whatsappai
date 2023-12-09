const express = require('express');
const campaignController = require('../controllers/campaignController.js');

const router = express.Router();

router.post('/',campaignController.createCampaign);
router.put('/:id',campaignController.updateCampaign);
router.get('/:id',campaignController.getCampaign);
router.get('/all/:id',campaignController.getCampaigns);
router.delete('/:id',campaignController.deleteCampaign);

module.exports = router;
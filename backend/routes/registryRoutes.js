const express = require('express');
const router = express.Router();
const { searchRegistry, getAllRegistry } = require('../controllers/registryController');

router.get('/search/:parcelNumber', searchRegistry);
router.get('/all', getAllRegistry);

module.exports = router;

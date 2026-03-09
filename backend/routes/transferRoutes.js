const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    initiateTransfer,
    confirmTransfer,
    completeTransfer,
    cancelTransfer
} = require('../controllers/transferController');

router.post('/initiate', protect, initiateTransfer);
router.get('/confirm/:token', confirmTransfer);
router.post('/complete/:token', completeTransfer);
router.delete('/cancel/:documentId', protect, cancelTransfer);

module.exports = router;

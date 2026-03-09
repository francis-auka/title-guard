const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    initiatePayment,
    checkPaymentStatus,
    mpesaCallback
} = require('../controllers/mpesaController');

router.post('/initiate', protect, initiatePayment);
router.get('/status/:checkoutRequestID', protect, checkPaymentStatus);
router.post('/callback', mpesaCallback); // No auth — called by Safaricom

module.exports = router;

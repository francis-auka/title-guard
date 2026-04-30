const Payment = require('../models/Payment');
const { initiateSTKPush, querySTKStatus } = require('../utils/mpesa');
const { sendSms } = require('../utils/sms');

// Initiate STK Push payment
const initiatePayment = async (req, res) => {
    try {
        const { phone, purpose, documentReference } = req.body;

        // Mock Mode for development when Safaricom is down
        if (process.env.MPESA_MOCK_SUCCESS === 'true') {
            const mockCheckoutID = 'ws_CO_MOCK_' + Date.now();
            const payment = new Payment({
                user: req.user._id,
                phone: phone, // Changed from phoneNumber to phone for consistency
                amount: purpose === 'registration' ? 5 : 1,
                purpose,
                checkoutRequestID: mockCheckoutID,
                status: 'completed',
                documentReference: documentReference || '',
            });
            await payment.save();
            return res.status(200).json({
                success: true,
                message: 'Mock Payment Initiated (Mock Mode)',
                checkoutRequestID: mockCheckoutID,
                paymentId: payment._id,
                amount: payment.amount,
            });
        }

        if (!phone || !purpose) {
            return res.status(400).json({
                message: 'Phone number and purpose are required.'
            });
        }

        // Set amount based on purpose
        const amount = purpose === 'registration' ? 5 : 1;
        const accountReference = purpose === 'registration'
            ? 'TG-REG'
            : 'TG-VER';
        const transactionDesc = purpose === 'registration'
            ? 'Doc Reg'
            : 'Doc Ver';

        // Initiate STK Push
        const stkResponse = await initiateSTKPush({
            phone,
            amount,
            accountReference,
            transactionDesc,
        });

        if (stkResponse.ResponseCode !== '0') {
            return res.status(400).json({
                message: 'Failed to initiate payment. Please try again.'
            });
        }

        // Save payment record
        const payment = await Payment.create({
            user: req.user._id,
            phone,
            amount,
            purpose,
            status: 'pending',
            checkoutRequestID: stkResponse.CheckoutRequestID,
            merchantRequestID: stkResponse.MerchantRequestID,
            documentReference: documentReference || '',
        });

        res.status(200).json({
            message: 'Payment initiated. Check your phone for the M-Pesa prompt.',
            checkoutRequestID: stkResponse.CheckoutRequestID,
            paymentId: payment._id,
            amount,
        });

    } catch (error) {
        if (error.response) {
            console.error('M-Pesa API Error:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('M-Pesa initiation error:', error.message);
        }
        res.status(500).json({
            message: 'Payment initiation failed. ' + (error.response?.data?.errorMessage || error.message)
        });
    }
};

// Poll payment status
const checkPaymentStatus = async (req, res) => {
    try {
        const { checkoutRequestID } = req.params;

        // Mock Mode for development when Safaricom is down
        if (process.env.MPESA_MOCK_SUCCESS === 'true' && checkoutRequestID.startsWith('ws_CO_MOCK_')) {
            const payment = await Payment.findOne({ checkoutRequestID });
            if (payment && payment.status === 'completed') {
                return res.status(200).json({
                    status: 'completed',
                    message: 'Payment successful (Mock Mode)',
                    amount: payment.amount,
                    purpose: payment.purpose,
                });
            }
            // If mock but not found or not completed, fall through to pending
            return res.json({ status: 'pending', message: 'Mock payment still pending or not found in DB.' });
        }

        // Check in our database first
        const payment = await Payment.findOne({ checkoutRequestID });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }

        // If already completed or failed, return from DB
        if (payment.status === 'completed') {
            return res.json({
                status: 'completed',
                mpesaReceiptNumber: payment.mpesaReceiptNumber,
                amount: payment.amount,
                purpose: payment.purpose,
            });
        }

        if (payment.status === 'failed') {
            return res.json({ status: 'failed' });
        }

        // Query Safaricom for latest status
        try {
            const statusResponse = await querySTKStatus(checkoutRequestID);

            // Safaricom ResultCode 0 means SUCCESS
            if (statusResponse.ResultCode == 0) {
                payment.status = 'completed';
                await payment.save();
                return res.json({
                    status: 'completed',
                    amount: payment.amount,
                    purpose: payment.purpose,
                });
            } else if (statusResponse.ResultCode !== undefined && statusResponse.ResultCode != null) {
                // If we have a ResultCode and it's NOT 0, it means the payment failed or was cancelled
                payment.status = 'failed';
                await payment.save();
                return res.json({ status: 'failed' });
            }
        } catch (queryError) {
            // Query might fail if payment is still processing
            console.log('STK query pending:', queryError.message);
        }

        // Still pending
        res.json({ status: 'pending' });

    } catch (error) {
        console.error('Payment status check error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// M-Pesa callback (called by Safaricom after payment)
const mpesaCallback = async (req, res) => {
    try {
        console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

        const callbackData = req.body.Body?.stkCallback;

        if (!callbackData) {
            return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        const { MerchantRequestID, CheckoutRequestID, ResultCode, CallbackMetadata } = callbackData;

        const payment = await Payment.findOne({ checkoutRequestID: CheckoutRequestID });

        if (!payment) {
            return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        if (ResultCode === 0) {
            // Payment successful — extract receipt number
            const items = CallbackMetadata?.Item || [];
            const receiptItem = items.find(item => item.Name === 'MpesaReceiptNumber');
            const amountItem = items.find(item => item.Name === 'Amount');

            payment.status = 'completed';
            payment.mpesaReceiptNumber = receiptItem?.Value || '';
            await payment.save();

            console.log('Payment completed:', payment.mpesaReceiptNumber);

            // Send SMS confirmation to payer (non-blocking)
            if (payment.phone) {
                const receiptNum = receiptItem?.Value || 'N/A';
                const paidAmount = amountItem?.Value || payment.amount;
                sendSms(
                    payment.phone,
                    `TitleGuard: Payment of KES ${paidAmount} received. M-Pesa ref: ${receiptNum}. Your deed verification is now processing. Thank you. - TitleGuard`
                );
            }
        } else {
            payment.status = 'failed';
            await payment.save();
            console.log('Payment failed. ResultCode:', ResultCode);
        }

        res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    } catch (error) {
        console.error('Callback error:', error.message);
        res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
};

module.exports = { initiatePayment, checkPaymentStatus, mpesaCallback };

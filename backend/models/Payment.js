const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    purpose: {
        type: String,
        enum: ['registration', 'verification'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    checkoutRequestID: { type: String },
    merchantRequestID: { type: String },
    mpesaReceiptNumber: { type: String },
    documentReference: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

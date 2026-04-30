const mongoose = require('mongoose');

const landRegistrySchema = new mongoose.Schema({
    parcelNumber: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    nationalId: { type: String },
    phoneNumber: { type: String },
    county: { type: String, required: true },
    area: { type: String, required: true },
    titleNumber: { type: String, required: true },
    verificationId: { type: String },
    dateIssued: { type: String, required: true },
    landUse: { type: String, required: true },
    tenure: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'disputed', 'transferred'],
        default: 'active'
    },
    registeredOnTitleGuard: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('LandRegistry', landRegistrySchema);

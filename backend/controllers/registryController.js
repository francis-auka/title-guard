const LandRegistry = require('../models/LandRegistry');

// Cross-reference a document against the registry
const crossReference = async (parcelNumber, ownerName) => {
    const record = await LandRegistry.findOne({ parcelNumber });

    if (!record) {
        return {
            status: 'unverified',
            message: 'This parcel number is not found in the land registry.',
            registryRecord: null,
        };
    }

    // Normalize names for comparison (uppercase, trim)
    const registryName = record.ownerName.toUpperCase().trim();
    const documentName = ownerName.toUpperCase().trim();

    if (registryName !== documentName) {
        return {
            status: 'flagged',
            message: `FRAUD ALERT: Registry shows owner as "${record.ownerName}" but document claims "${ownerName}".`,
            registryRecord: record,
        };
    }

    return {
        status: 'verified',
        message: 'Document matches official land registry records.',
        registryRecord: record,
    };
};

// Public registry search endpoint
const searchRegistry = async (req, res) => {
    try {
        const { parcelNumber } = req.params;
        const record = await LandRegistry.findOne({ parcelNumber });
        if (!record) {
            return res.status(404).json({
                message: 'Parcel not found in registry.'
            });
        }
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all registry records (for admin/demo purposes)
const getAllRegistry = async (req, res) => {
    try {
        const records = await LandRegistry.find({}).sort({ parcelNumber: 1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { crossReference, searchRegistry, getAllRegistry };

const LandRegistry = require('../models/LandRegistry');
const Document = require('../models/Document');

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
        const record = await LandRegistry.findOne({ parcelNumber }).lean();
        if (!record) {
            return res.status(404).json({
                message: 'Parcel not found in registry.'
            });
        }

        // Dynamically check TitleGuard registration
        const isRegistered = await Document.exists({ parcelNumber: record.parcelNumber });
        record.registeredOnTitleGuard = !!isRegistered;

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all registry records (for admin/demo purposes)
const getAllRegistry = async (req, res) => {
    try {
        const records = await LandRegistry.find({}).sort({ parcelNumber: 1 }).lean();

        // Get all unique registered parcel numbers from TitleGuard
        const registeredParcels = await Document.distinct('parcelNumber');
        const registeredParcelsSet = new Set(registeredParcels);

        // Dynamically add the registration status
        const enhancedRecords = records.map(record => ({
            ...record,
            registeredOnTitleGuard: registeredParcelsSet.has(record.parcelNumber)
        }));

        res.json(enhancedRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { crossReference, searchRegistry, getAllRegistry };

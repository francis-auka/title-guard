const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Document = require('./models/Document');
const { registerDocumentOnChain } = require('./blockchain/contract');

async function syncOne(parcelNum) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const doc = await Document.findOne({ parcelNumber: parcelNum });

        if (!doc) {
            console.error(`Document not found: ${parcelNum}`);
            process.exit(1);
        }

        console.log(`\nSyncing parcel: ${doc.parcelNumber}`);

        // Fill legacy fields if missing
        if (!doc.ownerName) doc.ownerName = "LEGACY OWNER";
        if (!doc.county) doc.county = "UNKNOWN";
        if (!doc.area) doc.area = 0;

        const txHash = await registerDocumentOnChain(doc.documentHash, doc.parcelNumber);

        if (txHash) {
            doc.blockchainTxHash = txHash;
            doc.status = 'verified';
            await doc.save();
            console.log(`✅ Sync successful: ${txHash}`);
        } else {
            console.error(`❌ Sync failed for parcel: ${doc.parcelNumber}. Check contract.js logs above.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Fatal Sync Error:', error.message);
        process.exit(1);
    }
}

syncOne('LOC/3344/112');

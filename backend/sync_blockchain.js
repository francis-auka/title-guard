const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Document = require('./models/Document');
const { registerDocumentOnChain } = require('./blockchain/contract');

async function syncAll() {
    try {
        console.log('--- Starting Blockchain Sync ---');
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const docs = await Document.find({
            $or: [
                { blockchainTxHash: { $exists: false } },
                { blockchainTxHash: null },
                { status: { $ne: 'verified' } }
            ]
        });

        console.log(`Found ${docs.length} documents needing sync.`);

        for (const doc of docs) {
            console.log(`\nSyncing parcel: ${doc.parcelNumber}`);

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
                console.error(`❌ Sync failed for parcel: ${doc.parcelNumber}`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('\n--- Sync Process Completed ---');
        process.exit(0);
    } catch (error) {
        console.error('Fatal Sync Error:', error.message);
        process.exit(1);
    }
}

syncAll();

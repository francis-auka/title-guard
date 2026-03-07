const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Document = require('./models/Document');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Document.countDocuments({
        $or: [
            { ownerName: { $exists: false } },
            { ownerName: null },
            { ownerName: "" }
        ]
    });
    console.log('Docs missing ownerName:', count);
    if (count > 0) {
        const sample = await Document.findOne({
            $or: [
                { ownerName: { $exists: false } },
                { ownerName: null },
                { ownerName: "" }
            ]
        });
        console.log('Sample Parcel:', sample.parcelNumber);
    }
    process.exit(0);
}

check();

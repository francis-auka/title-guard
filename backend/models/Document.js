const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        parcelNumber: {
            type: String,
            required: [true, "Parcel number is required"],
            unique: true,
            trim: true,
            uppercase: true,
        },
        documentHash: {
            type: String,
            required: [true, "Document hash is required"],
            unique: true,
        },
        verificationId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number, // bytes
            required: true,
        },
        mimeType: {
            type: String,
            default: "application/octet-stream",
        },
        // Optional blockchain reference
        blockchainTxHash: {
            type: String,
            default: null,
        },
        contractAddress: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["registered", "pending", "failed"],
            default: "registered",
        },
        // Ownership Metadata (for fraud detection)
        ownerName: {
            type: String,
            required: [true, "Owner name is required"],
            trim: true,
            uppercase: true,
        },
        county: {
            type: String,
            required: [true, "County is required"],
            trim: true,
            uppercase: true,
        },
        area: {
            type: Number, // in hectares or acres
            required: [true, "Land area is required"],
        },
        notes: {
            type: String,
            maxlength: 500,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
documentSchema.index({ documentHash: 1 });
documentSchema.index({ parcelNumber: 1 });
documentSchema.index({ ownerName: 1, county: 1, area: 1 }); // For metadata conflict check
documentSchema.index({ parcelNumber: "text", fileName: "text", ownerName: "text" });

module.exports = mongoose.model("Document", documentSchema);

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

// Text index for search
documentSchema.index({ parcelNumber: "text", fileName: "text" });

module.exports = mongoose.model("Document", documentSchema);

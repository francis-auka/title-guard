const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const Document = require("../models/Document");
const User = require("../models/User");
const extractPdfData = require("../utils/extractPdfData");
const { sendSms } = require("../utils/sms");

const router = express.Router();

// Multer for verification file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/verify/file
// Verify a document by uploading the file — computes hash and checks DB
// ─────────────────────────────────────────────────────────────────────────────
router.post("/file", upload.single("document"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded for verification.",
            });
        }

        // Compute SHA-256 hash of the uploaded file
        const documentHash = crypto
            .createHash("sha256")
            .update(req.file.buffer)
            .digest("hex");

        // Search for matching hash in the database
        const matchedDocument = await Document.findOne({ documentHash }).populate(
            "owner",
            "name email"
        );

        // EXTRACTION for comparison
        let extracted = null;
        if (req.file.mimetype === "application/pdf") {
            extracted = await extractPdfData(req.file.buffer);
        }

        if (matchedDocument) {
            // Send SMS alert
            try {
                const owner = await User.findById(matchedDocument.owner).select("phone");
                const targetPhone = extracted.phoneNumber || (owner && owner.phone);
                
                if (targetPhone) {
                    console.log(`[SMS] Attempting to send verification SMS to ${targetPhone} (Source: ${extracted.phoneNumber ? 'Extracted' : 'User Profile'})`);
                    const verifyDate = new Date().toLocaleDateString("en-KE", {
                        day: "numeric", month: "long", year: "numeric"
                    });
                    const shortHash = matchedDocument.documentHash.substring(0, 10);
                    
                    const { formatKenyanPhone } = require("../utils/sms");
                    const formattedPhone = formatKenyanPhone(targetPhone);
                    
                    if (formattedPhone) {
                        sendSms(
                            formattedPhone,
                            `TitleGuard ALERT: Your title deed (hash: ${shortHash}...) was just verified on ${verifyDate}. If you did NOT authorize this verification, contact Ardhi House immediately. - TitleGuard`
                        );
                        console.log(`[SMS] Verification SMS sent to ${formattedPhone}`);
                    } else {
                        console.warn(`[SMS] Verification SMS skipped - invalid phone: ${targetPhone}`);
                    }
                } else {
                    console.warn(`[SMS] Verification SMS skipped - No phone number found for owner of doc ${matchedDocument.parcelNumber} or in document.`);
                }
            } catch (smsErr) {
                console.error("[SMS] Verification SMS error (non-fatal):", smsErr.message);
            }

            return res.json({
                success: true,
                authentic: true,
                message: "✅ Document is AUTHENTIC — matches a registered title deed.",
                data: {
                    parcelNumber: matchedDocument.parcelNumber,
                    verificationId: matchedDocument.verificationId,
                    fileName: matchedDocument.fileName,
                    registeredAt: matchedDocument.createdAt,
                    documentHash: matchedDocument.documentHash,
                    registeredBy: matchedDocument.owner
                        ? matchedDocument.owner.name
                        : "Unknown",
                    status: matchedDocument.status,
                    verificationStatus: matchedDocument.verificationStatus,
                    metadata: extracted, // Show what's currently in the file
                },
            });
        } else {
            // Check if there's a parcel number provided or extracted
            const parcelNumber = req.body.parcelNumber || (extracted ? extracted.parcelNumber : null);

            if (parcelNumber) {
                const normalizedParcel = parcelNumber.trim().toUpperCase();
                const parcelRecord = await Document.findOne({
                    parcelNumber: normalizedParcel,
                });

                if (parcelRecord) {
                    // REGISTRY CHECK FOR TAMPERED CASE
                    const { crossReference } = require("../controllers/registryController");
                    const registryCheck = await crossReference(parcelRecord.parcelNumber, parcelRecord.ownerName);

                    return res.json({
                        success: true,
                        authentic: false,
                        tampered: true,
                        message:
                            "⚠️ TAMPERED — A document is registered for this parcel number, but the uploaded file does NOT match the registered content.",
                        registryStatus: registryCheck.status,
                        registryMessage: registryCheck.message,
                        data: {
                            parcelNumber: normalizedParcel,
                            registeredAt: parcelRecord.createdAt,
                            computedHash: documentHash,
                            registeredHash: parcelRecord.documentHash,
                            extractedMetadata: extracted,
                            verificationStatus: parcelRecord.verificationStatus,
                        },
                        registryRecord: registryCheck.registryRecord ? {
                            titleNumber: registryCheck.registryRecord.titleNumber,
                            county: registryCheck.registryRecord.county,
                            area: registryCheck.registryRecord.area,
                            landUse: registryCheck.registryRecord.landUse,
                            tenure: registryCheck.registryRecord.tenure,
                            dateIssued: registryCheck.registryRecord.dateIssued,
                        } : null,
                    });
                }
            }

            // REGISTRY CHECK FOR UNREGISTERED CASE
            let registryCheck = { status: 'unverified', message: 'This parcel was not found in our registry simulation.', registryRecord: null };
            if (extracted && extracted.parcelNumber && extracted.ownerName) {
                const { crossReference } = require("../controllers/registryController");
                registryCheck = await crossReference(extracted.parcelNumber, extracted.ownerName);
            }

            return res.json({
                success: true,
                authentic: false,
                tampered: false,
                message:
                    "❌ Document NOT found in the registry. This file has not been registered.",
                registryStatus: registryCheck.status,
                registryMessage: registryCheck.message,
                data: {
                    computedHash: documentHash,
                    extractedMetadata: extracted,
                },
                registryRecord: registryCheck.registryRecord ? {
                    titleNumber: registryCheck.registryRecord.titleNumber,
                    county: registryCheck.registryRecord.county,
                    area: registryCheck.registryRecord.area,
                    landUse: registryCheck.registryRecord.landUse,
                    tenure: registryCheck.registryRecord.tenure,
                    dateIssued: registryCheck.registryRecord.dateIssued,
                } : null,
            });
        }
    } catch (err) {
        console.error("[Verify/File]", err.message);
        res.status(500).json({
            success: false,
            message: "Verification failed. Please try again.",
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/verify/:verificationId
// Verify / lookup a document by its UUID verification ID
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:verificationId", async (req, res) => {
    try {
        const { verificationId } = req.params;

        if (!verificationId) {
            return res.status(400).json({
                success: false,
                message: "Verification ID is required.",
            });
        }

        const doc = await Document.findOne({ verificationId }).populate(
            "owner",
            "name"
        );

        if (!doc) {
            return res.status(404).json({
                success: false,
                found: false,
                message: "No document found with this verification ID.",
            });
        }

        res.json({
            success: true,
            found: true,
            message: "Document found in registry.",
            data: {
                parcelNumber: doc.parcelNumber,
                verificationId: doc.verificationId,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                documentHash: doc.documentHash,
                registeredAt: doc.createdAt,
                registeredBy: doc.owner ? doc.owner.name : "Unknown",
                status: doc.status,
                blockchainTxHash: doc.blockchainTxHash,
                contractAddress: doc.contractAddress,
            },
        });
    } catch (err) {
        console.error("[Verify/ID]", err.message);
        res.status(500).json({
            success: false,
            message: "Lookup failed. Please try again.",
        });
    }
});

module.exports = router;

const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/auth");
const Document = require("../models/Document");

const router = express.Router();

// Multer: memory storage (no disk writes; hash the buffer directly)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB max
    },
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error("Unsupported file type. Please upload PDF, JPG, PNG, or DOCX."),
                false
            );
        }
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents/register   (protected)
// Upload and register a title deed document
// ─────────────────────────────────────────────────────────────────────────────
router.post(
    "/register",
    protect,
    upload.single("document"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No document file uploaded. Please attach a file.",
                });
            }

            const { parcelNumber, notes } = req.body;

            if (!parcelNumber || parcelNumber.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Parcel number is required.",
                });
            }

            const normalizedParcel = parcelNumber.trim().toUpperCase();

            // Compute SHA-256 hash of the file buffer
            const documentHash = crypto
                .createHash("sha256")
                .update(req.file.buffer)
                .digest("hex");

            // Check for duplicate hash (same document content)
            const existingByHash = await Document.findOne({ documentHash });
            if (existingByHash) {
                return res.status(409).json({
                    success: false,
                    message:
                        "This exact document has already been registered. Duplicate file content detected.",
                    conflictType: "DUPLICATE_HASH",
                    existingParcel: existingByHash.parcelNumber,
                    existingVerificationId: existingByHash.verificationId,
                });
            }

            // Check for duplicate parcel number
            const existingByParcel = await Document.findOne({
                parcelNumber: normalizedParcel,
            });
            if (existingByParcel) {
                return res.status(409).json({
                    success: false,
                    message: `Parcel number "${normalizedParcel}" is already registered.`,
                    conflictType: "DUPLICATE_PARCEL",
                    existingVerificationId: existingByParcel.verificationId,
                });
            }

            // Create verification UUID
            const verificationId = uuidv4();

            // Save document record
            const doc = await Document.create({
                owner: req.user._id,
                parcelNumber: normalizedParcel,
                documentHash,
                verificationId,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                notes: notes || "",
            });

            res.status(201).json({
                success: true,
                message: "Document registered successfully.",
                data: {
                    id: doc._id,
                    parcelNumber: doc.parcelNumber,
                    verificationId: doc.verificationId,
                    documentHash: doc.documentHash,
                    fileName: doc.fileName,
                    fileSize: doc.fileSize,
                    registeredAt: doc.createdAt,
                },
            });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Duplicate parcel number or document hash detected.",
                });
            }
            console.error("[Documents/Register]", err.message);
            res.status(500).json({
                success: false,
                message: "Document registration failed. Please try again.",
            });
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents   (protected)
// List all documents registered by the current user
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [documents, total] = await Promise.all([
            Document.find({ owner: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("-__v"),
            Document.countDocuments({ owner: req.user._id }),
        ]);

        res.json({
            success: true,
            data: documents,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        });
    } catch (err) {
        console.error("[Documents/List]", err.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch documents.",
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id   (protected)
// Get a single document by MongoDB ID
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
    try {
        const doc = await Document.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: "Document not found.",
            });
        }

        res.json({ success: true, data: doc });
    } catch (err) {
        console.error("[Documents/Get]", err.message);
        res.status(500).json({ success: false, message: "Failed to fetch document." });
    }
});

module.exports = router;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");
const verifyRoutes = require("./routes/verify");
const transferRoutes = require("./routes/transferRoutes");

// ─── App Init ─────────────────────────────────────────────────────────────────
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        service: "TitleGuard API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});

// ─── Database Status Middleware ────────────────────────────────────────────────
// Prevents requests from hanging if DB is not connected
app.use("/api", (req, res, next) => {
    // Skip health check
    if (req.path === "/health") return next();

    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "Database is not connected. Please check server logs.",
        });
    }
    next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/mpesa", require("./routes/mpesaRoutes"));
app.use("/api/registry", require("./routes/registryRoutes"));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("[Error]", err.message || err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

// ─── Server Start (always start first, then connect DB) ───────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Start server immediately so Render detects the open port
app.listen(PORT, () => {
    console.log(`🚀 TitleGuard API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// ─── Database Connection ───────────────────────────────────────────────────────
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined — database features will be unavailable");
} else {
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("✅ MongoDB connected");
        })
        .catch((err) => {
            console.error("❌ MongoDB connection error:", err.message);
            // Don't exit — server stays up, DB-dependent routes will return errors
        });
}

module.exports = app;
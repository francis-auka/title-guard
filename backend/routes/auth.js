const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * Helper: Generate a signed JWT
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters.",
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        // Create user (password is hashed via pre-save hook)
        const user = await User.create({ name, email, password });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }
        console.error("[Auth/Register]", err.message);
        res.status(500).json({ success: false, message: "Registration failed. Please try again." });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        // Find user and explicitly select password (excluded by default)
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        console.error("[Auth/Login]", err.message);
        res.status(500).json({ success: false, message: "Login failed. Please try again." });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected — verify token is still valid)
// ─────────────────────────────────────────────────────────────────────────────
const { protect } = require("../middleware/auth");

router.get("/me", protect, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            createdAt: req.user.createdAt,
        },
    });
});

module.exports = router;

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware: Verify JWT token and attach req.user
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (without password)
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Token is valid but user no longer exists.",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please log in again.",
            });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Authentication error.",
        });
    }
};

/**
 * Middleware: Restrict to admin role
 */
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admins only.",
        });
    }
    next();
};

module.exports = { protect, adminOnly };

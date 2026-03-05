import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

/**
 * Provides authentication state (user, token) and actions (login, logout)
 * throughout the entire application.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // checking localStorage on mount

    // ── Restore session from localStorage on app load ─────────────────────────
    useEffect(() => {
        const savedToken = localStorage.getItem("tg_token");
        const savedUser = localStorage.getItem("tg_user");

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                // Corrupted data — clear it
                localStorage.removeItem("tg_token");
                localStorage.removeItem("tg_user");
            }
        }
        setLoading(false);
    }, []);

    /**
     * Login: persist token + user to state and localStorage.
     * @param {string} newToken  - JWT token from the API
     * @param {object} userData  - User object from the API
     */
    const login = useCallback((newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("tg_token", newToken);
        localStorage.setItem("tg_user", JSON.stringify(userData));
    }, []);

    /**
     * Logout: clear all auth state.
     */
    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("tg_token");
        localStorage.removeItem("tg_user");
    }, []);

    /**
     * Refresh user data from the API.
     */
    const refreshUser = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            if (data.success) {
                setUser(data.user);
                localStorage.setItem("tg_user", JSON.stringify(data.user));
            }
        } catch {
            logout();
        }
    }, [logout]);

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access auth context.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an <AuthProvider>");
    }
    return context;
}

export default AuthContext;

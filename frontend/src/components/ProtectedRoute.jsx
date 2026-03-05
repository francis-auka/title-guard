import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to /login, preserving the attempted URL.
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show nothing while restoring session from localStorage
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login, but save the location so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;

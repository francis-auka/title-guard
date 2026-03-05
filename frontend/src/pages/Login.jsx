import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", form);
            if (data.success) {
                login(data.token, data.user);
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper flex items-center justify-center py-16 px-4">
            <div className="w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent-600/20 border border-accent-600/30 mb-4">
                        <svg className="w-7 h-7 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                    <p className="text-slate-400 text-sm mt-1">Sign in to your TitleGuard account</p>
                </div>

                {/* Card */}
                <div className="card-elevated p-8">
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                            <span className="mt-0.5 shrink-0">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="form-group">
                            <label htmlFor="email" className="label">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="label">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="input"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base mt-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 text-sm mt-5">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
                        Create one free
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;

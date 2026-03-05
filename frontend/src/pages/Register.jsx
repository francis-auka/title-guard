import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name || !form.email || !form.password) {
            setError("All fields are required.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password,
            });

            if (data.success) {
                login(data.token, data.user);
                navigate("/dashboard", { replace: true });
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Registration failed. Please try again."
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create your account</h1>
                    <p className="text-slate-400 text-sm mt-1">Start protecting your property documents today</p>
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
                            <label htmlFor="name" className="label">Full name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="John Kamau"
                                className="input"
                                required
                            />
                        </div>

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
                                autoComplete="new-password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min. 6 characters"
                                className="input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm" className="label">Confirm password</label>
                            <input
                                id="confirm"
                                name="confirm"
                                type="password"
                                autoComplete="new-password"
                                value={form.confirm}
                                onChange={handleChange}
                                placeholder="Repeat your password"
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
                                    Creating account…
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 text-sm mt-5">
                    Already have an account?{" "}
                    <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;

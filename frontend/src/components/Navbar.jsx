import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
    { to: "/verify", label: "Verify Document", public: true },
    { to: "/dashboard", label: "Dashboard", public: false },
    { to: "/upload", label: "Register Deed", public: false },
];

function ShieldIcon() {
    return (
        <svg
            className="w-7 h-7 text-accent-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
        </svg>
    );
}

function MenuIcon({ open }) {
    return (
        <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
        </svg>
    );
}

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate("/login");
    };

    const filteredLinks = navLinks.filter(
        (link) => link.public || isAuthenticated
    );

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
            <div className="container-wide">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 group"
                        onClick={() => setMenuOpen(false)}
                    >
                        <ShieldIcon />
                        <span className="text-xl font-bold text-white group-hover:text-accent-300 transition-colors">
                            Title<span className="text-accent-400">Guard</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {filteredLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-accent-600/20 text-accent-400"
                                        : "text-slate-300 hover:text-white hover:bg-white/5"
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-slate-400">
                                    Hi,{" "}
                                    <span className="text-slate-200 font-medium">
                                        {user?.name?.split(" ")[0]}
                                    </span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="btn-outline text-sm py-2 px-4"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-outline text-sm py-2 px-4">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        <MenuIcon open={menuOpen} />
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-slate-800 py-3 animate-fade-in">
                        {filteredLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block px-4 py-3 text-sm font-medium rounded-lg mx-1 mb-1 transition-colors ${isActive
                                        ? "bg-accent-600/20 text-accent-400"
                                        : "text-slate-300 hover:text-white hover:bg-white/5"
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        <div className="mt-3 pt-3 border-t border-slate-800 px-1 flex flex-col gap-2">
                            {isAuthenticated ? (
                                <>
                                    <p className="text-xs text-slate-500 px-3">
                                        Signed in as <span className="text-slate-300">{user?.email}</span>
                                    </p>
                                    <button
                                        onClick={handleLogout}
                                        className="btn-outline text-sm w-full"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMenuOpen(false)}
                                        className="btn-outline text-sm text-center"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMenuOpen(false)}
                                        className="btn-primary text-sm text-center"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;

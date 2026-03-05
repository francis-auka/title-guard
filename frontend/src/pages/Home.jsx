import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
    {
        icon: "🔒",
        title: "SHA-256 Hashing",
        description:
            "Every document is cryptographically fingerprinted before being stored on the blockchain — any tampering is instantly detectable.",
    },
    {
        icon: "⛓️",
        title: "Polygon Blockchain",
        description:
            "Document hashes are permanently recorded on Polygon Amoy Testnet, making them immutable and transparent.",
    },
    {
        icon: "🔍",
        title: "Instant Verification",
        description:
            "Upload any title deed and know in seconds whether it's authentic or has been fraudulently altered.",
    },
    {
        icon: "🆔",
        title: "Verification IDs",
        description:
            "Each registered document gets a unique UUID anyone can use to look up and verify a deed's authenticity without uploading files.",
    },
    {
        icon: "🎯",
        title: "Parcel Conflict Detection",
        description:
            "Duplicate registrations for the same land parcel are automatically blocked, preventing double-registration fraud.",
    },
    {
        icon: "🇰🇪",
        title: "Built for Kenya",
        description:
            "Designed around Kenya's land registry system with parcel number formats and Kenyan property law considerations.",
    },
];

function StatCard({ value, label }) {
    return (
        <div className="card p-6 text-center">
            <p className="text-3xl font-bold text-gradient">{value}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="card p-6 hover:border-accent-700/50 transition-all duration-300 group">
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent-300 transition-colors">
                {title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="page-wrapper">
            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden py-24 sm:py-32">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-600/10 rounded-full blur-3xl" />
                    <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-primary-700/20 rounded-full blur-3xl" />
                </div>

                <div className="container-wide relative z-10 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-600/10 border border-accent-600/30 text-accent-400 text-sm font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse-slow" />
                        Live on Polygon Amoy Testnet
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                        Protect Kenya's{" "}
                        <span className="text-gradient">Land Rights</span>
                        <br />
                        with Blockchain
                    </h1>

                    <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        TitleGuard uses cryptographic hashing and blockchain immutability to
                        authenticate property title deeds — making document fraud{" "}
                        <span className="text-white font-medium">instantly detectable</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isAuthenticated ? (
                            <>
                                <Link to="/upload" className="btn-primary text-base px-8 py-3">
                                    Register a Title Deed
                                </Link>
                                <Link to="/dashboard" className="btn-outline text-base px-8 py-3">
                                    View Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary text-base px-8 py-3">
                                    Get Started — Free
                                </Link>
                                <Link to="/verify" className="btn-outline text-base px-8 py-3">
                                    Verify a Document
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Stats ─────────────────────────────────────────────────────────── */}
            <section className="py-12 border-y border-slate-800/50">
                <div className="container-wide grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard value="100%" label="Tamper Detection Accuracy" />
                    <StatCard value="< 1s" label="Verification Time" />
                    <StatCard value="SHA-256" label="Cryptographic Standard" />
                    <StatCard value="Polygon" label="Blockchain Network" />
                </div>
            </section>

            {/* ── How It Works ──────────────────────────────────────────────────── */}
            <section className="py-20">
                <div className="container-wide">
                    <div className="text-center mb-14">
                        <h2 className="section-heading">How TitleGuard Works</h2>
                        <p className="section-subheading max-w-xl mx-auto">
                            Three simple steps to protect your property documents from fraud.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
                        {/* Connector line for desktop */}
                        <div className="hidden sm:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-accent-600/40 to-transparent" />

                        {[
                            {
                                step: "01",
                                title: "Upload Your Document",
                                desc: "Securely upload your title deed PDF or image. No file is stored — only its cryptographic hash.",
                            },
                            {
                                step: "02",
                                title: "Hash & Register",
                                desc: "We compute a SHA-256 fingerprint of your document and record it permanently on the Polygon blockchain.",
                            },
                            {
                                step: "03",
                                title: "Share Verification ID",
                                desc: "Receive a unique verification ID. Anyone can use it to instantly confirm your deed's authenticity.",
                            },
                        ].map(({ step, title, desc }) => (
                            <div key={step} className="card p-8 text-center relative z-10">
                                <div className="w-12 h-12 rounded-full bg-accent-600/20 border border-accent-600/40 flex items-center justify-center text-accent-400 font-bold text-lg mx-auto mb-5">
                                    {step}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────────────────────── */}
            <section className="py-20 bg-slate-900/30">
                <div className="container-wide">
                    <div className="text-center mb-14">
                        <h2 className="section-heading">Why TitleGuard?</h2>
                        <p className="section-subheading">
                            Enterprise-grade document security for every Kenyan property owner.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f) => (
                            <FeatureCard key={f.title} {...f} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────────────── */}
            {!isAuthenticated && (
                <section className="py-20">
                    <div className="container-wide">
                        <div className="card p-10 text-center glow-accent">
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Ready to protect your property?
                            </h2>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                Join TitleGuard and make your title deeds fraud-proof in minutes.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link to="/register" className="btn-primary text-base px-8 py-3">
                                    Create Free Account
                                </Link>
                                <Link to="/verify" className="btn-outline text-base px-8 py-3">
                                    Verify a Document
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Home;

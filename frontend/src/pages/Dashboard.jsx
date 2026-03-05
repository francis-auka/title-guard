import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function formatBytes(bytes) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function DocumentRow({ doc }) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(doc.verificationId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="card p-5 hover:border-slate-600/70 transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Parcel + file */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="badge-info font-mono text-xs">{doc.parcelNumber}</span>
                        <span className="text-slate-400 text-xs font-semibold uppercase">{doc.ownerName}</span>
                        <span className="text-slate-500 text-xs italic">{doc.county}</span>
                        <span className="text-slate-600 text-xs">{doc.area} Ha</span>
                        <span className="text-slate-500 text-xs truncate max-w-[150px]">— {doc.fileName}</span>
                    </div>

                    {/* Verification ID */}
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 text-xs">Verification ID:</span>
                        <code className="text-xs text-accent-300 font-mono bg-slate-800 px-2 py-0.5 rounded truncate max-w-[200px] sm:max-w-none">
                            {doc.verificationId}
                        </code>
                        <button
                            onClick={copy}
                            title="Copy verification ID"
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                            {copied ? (
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Hash preview */}
                    <p className="text-xs text-slate-600 font-mono mt-2 truncate">
                        SHA-256: {doc.documentHash?.slice(0, 32)}…
                    </p>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                    <span className="badge-success text-xs">{doc.status || "registered"}</span>
                    <span className="text-slate-500 text-xs">{formatDate(doc.registeredAt || doc.createdAt)}</span>
                </div>
            </div>
        </div>
    );
}

function Dashboard() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);

    const fetchDocuments = async (p = 1) => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/documents?page=${p}&limit=8`);
            if (data.success) {
                setDocuments(data.data);
                setPagination(data.pagination);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load documents.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments(page);
    }, [page]);

    return (
        <div className="page-wrapper py-10">
            <div className="container-wide">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="section-heading">
                            My Documents
                        </h1>
                        <p className="section-subheading">
                            Welcome back, <span className="text-slate-200">{user?.name}</span>
                        </p>
                    </div>
                    <Link to="/upload" className="btn-primary shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Register New Deed
                    </Link>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="card p-5">
                        <p className="text-2xl font-bold text-white">{pagination.total ?? "—"}</p>
                        <p className="text-slate-400 text-sm mt-1">Registered Documents</p>
                    </div>
                    <div className="card p-5">
                        <p className="text-2xl font-bold text-emerald-400">{pagination.total ?? 0}</p>
                        <p className="text-slate-400 text-sm mt-1">Verified on Chain</p>
                    </div>
                    <div className="card p-5 col-span-2 sm:col-span-1">
                        <p className="text-2xl font-bold text-accent-400">100%</p>
                        <p className="text-slate-400 text-sm mt-1">Tamper Protected</p>
                    </div>
                </div>

                {/* Content */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="px-4 py-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {!loading && !error && documents.length === 0 && (
                    <div className="card p-16 text-center">
                        <div className="text-5xl mb-4">📄</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Register your first title deed to get started with blockchain protection.
                        </p>
                        <Link to="/upload" className="btn-primary">
                            Register a Title Deed
                        </Link>
                    </div>
                )}

                {!loading && documents.length > 0 && (
                    <>
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <DocumentRow key={doc._id} doc={doc} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-outline text-sm py-2 px-4 disabled:opacity-40"
                                >
                                    ← Previous
                                </button>
                                <span className="text-slate-400 text-sm">
                                    Page {page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="btn-outline text-sm py-2 px-4 disabled:opacity-40"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;

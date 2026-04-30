import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE_MB = 20;

function FileDropZone({ file, onFileChange }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFileChange(dropped);
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${dragging
                ? "border-accent-500 bg-accent-500/10"
                : file
                    ? "border-emerald-500/60 bg-emerald-500/5"
                    : "border-slate-600 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/50"
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => onFileChange(e.target.files[0])}
            />

            {file ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">📄</div>
                    <p className="text-emerald-400 font-medium text-sm">{file.name}</p>
                    <p className="text-slate-500 text-xs">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB · Click to change
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-slate-300 font-medium text-sm">
                            Drop your title deed here, or click to browse
                        </p>
                        <p className="text-slate-500 text-xs mt-1">PDF, JPG, PNG · Max {MAX_SIZE_MB} MB</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function UploadDocument() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [error, setError] = useState("");
    const [metadataConflict, setMetadataConflict] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [result, setResult] = useState(null);

    // M-Pesa Payment States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [phone, setPhone] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, pending, completed, failed
    const [checkoutRequestID, setCheckoutRequestID] = useState("");
    const [modalError, setModalError] = useState("");

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentStatus("idle");
        setModalError("");
    };

    const handleFileChange = async (f) => {
        setError("");
        setMetadataConflict(null);
        setExtractedData(null);

        if (!f) {
            setFile(null);
            return;
        }

        if (f.type !== "application/pdf") {
            setError("Security Policy: Only PDF documents are allowed for registration to ensure accurate metadata extraction.");
            return;
        }

        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
            return;
        }

        setFile(f);

        // Auto-extract metadata
        setExtracting(true);
        try {
            const formData = new FormData();
            formData.append("document", f);
            const { data } = await api.post("/documents/extract", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (data.success) {
                if (!data.data.parcelNumber || !data.data.ownerName) {
                    setError("Could not extract required data (Parcel # or Owner) from this PDF. Please ensure it's a valid title deed.");
                } else {
                    setExtractedData(data.data);
                }
            }
        } catch (err) {
            setError("Failed to extract metadata from the document. Please try a different scan.");
            console.error(err);
        } finally {
            setExtracting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMetadataConflict(null);

        if (!file) { setError("Please select a document file."); return; }
        if (!extractedData) { setError("Cannot proceed without valid document metadata."); return; }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("document", file);
            formData.append("notes", notes.trim());

            const { data } = await api.post("/documents/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (data.success) {
                setResult(data.data);
                setShowPaymentModal(false);
            }
        } catch (err) {
            const responseData = err.response?.data;
            if (responseData?.conflictType === "METADATA_CONFLICT") {
                setMetadataConflict({
                    message: responseData.message,
                    conflictingParcel: responseData.conflictingParcel,
                    verificationId: responseData.existingVerificationId
                });
            } else {
                setError(responseData?.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        setPaymentLoading(true);
        setError("");

        try {
            const { data } = await api.post("/mpesa/initiate", {
                phone,
                purpose: "registration"
            });

            setCheckoutRequestID(data.checkoutRequestID);
            setPaymentStatus("pending");

            // Start polling
            startPolling(data.checkoutRequestID);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to initiate payment.");
            setPaymentLoading(false);
        }
    };

    const startPolling = (requestID) => {
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;

            // Stop polling after 6 attempts (30 seconds at 5s intervals)
            if (attempts > 6) {
                clearInterval(interval);
                setPaymentStatus("processing");
                setPaymentLoading(false);
                return;
            }

            try {
                const { data } = await api.get(`/mpesa/status/${requestID}`);

                if (data.status === "completed") {
                    clearInterval(interval);
                    setPaymentStatus("completed");
                    // Automatically proceed to document registration
                    registerDocument();
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    setPaymentStatus("failed");
                    setPaymentLoading(false);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 5000);
    };

    const registerDocument = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("document", file);
            formData.append("notes", notes.trim());

            const { data } = await api.post("/documents/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (data.success) {
                setResult(data.data);
                setShowPaymentModal(false);
                setPaymentStatus("idle");
            }
        } catch (err) {
            // Surface error inside the modal so the user isn't stuck
            const msg = err.response?.data?.message || "Registration failed after payment. Please contact support.";
            setModalError(msg);
            setPaymentStatus("failed");
        } finally {
            setLoading(false);
            setPaymentLoading(false);
        }
    };

    // ── Success state ──────────────────────────────────────────────────────────
    if (result) {
        return (
            <div className="page-wrapper py-16 px-4">
                <div className="max-w-lg mx-auto animate-slide-up">
                    <div className="card-elevated p-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Document Registered!</h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Your title deed has been cryptographically secured on the blockchain.
                        </p>

                        <div className="bg-slate-800/60 rounded-xl p-5 text-left space-y-3 mb-8">
                            {[
                                { label: "Parcel Number", value: result.parcelNumber, mono: true },
                                { label: "Verification ID", value: result.verificationId, mono: true },
                                { label: "File Name", value: result.fileName },
                                {
                                    label: "Document Hash (SHA-256)",
                                    value: result.documentHash?.slice(0, 32) + "…",
                                    mono: true,
                                },
                            ].map(({ label, value, mono }) => (
                                <div key={label} className="flex flex-col gap-0.5">
                                    <span className="text-slate-500 text-xs">{label}</span>
                                    <span className={`text-sm text-slate-200 break-all ${mono ? "font-mono" : ""}`}>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setResult(null);
                                    setFile(null);
                                    setExtractedData(null);
                                    setNotes("");
                                }}
                                className="btn-outline flex-1"
                            >
                                Register Another
                            </button>
                            <button onClick={() => navigate("/dashboard")} className="btn-primary flex-1">
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper py-10 px-4">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                            Security Enhanced
                        </span>
                        <h1 className="text-2xl font-bold text-white">Register Title Deed</h1>
                    </div>
                    <p className="section-subheading">
                        All property metadata is automatically extracted from your document to prevent fraud.
                    </p>
                </div>

                <div className="card-elevated p-8">
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                            <span className="mt-0.5 shrink-0">⚠️</span>
                            {error}
                        </div>
                    )}

                    {metadataConflict && (
                        <div className="mb-6 px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 animate-slide-up">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">🚨</span>
                                <h4 className="font-bold text-sm uppercase tracking-wider">Potential Fraud Detected</h4>
                            </div>
                            <p className="text-sm leading-relaxed mb-3 opacity-90">
                                {metadataConflict.message}
                            </p>
                            <div className="bg-amber-950/40 rounded-lg p-3 border border-amber-500/20 text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-amber-500/70 uppercase">Conflicting Parcel</span>
                                    <span className="font-mono text-amber-400">{metadataConflict.conflictingParcel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-amber-500/70 uppercase">Verification ID</span>
                                    <span className="font-mono text-amber-400">{metadataConflict.verificationId.slice(0, 18)}...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* File upload */}
                        <div className="form-group">
                            <label className="label">Title Deed PDF</label>
                            <FileDropZone file={file} onFileChange={handleFileChange} />
                            <p className="text-[10px] text-slate-500 mt-2 italic px-1">
                                Note: Only scanned PDF certificates are currently supported for automated metadata extraction.
                            </p>
                        </div>

                        {/* Extraction Loader */}
                        {extracting && (
                            <div className="py-6 flex flex-col items-center justify-center bg-slate-800/20 rounded-xl border border-dashed border-slate-700 animate-pulse">
                                <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mb-3" />
                                <p className="text-xs text-slate-400 font-medium">Extracting metadata from PDF...</p>
                            </div>
                        )}

                        {/* Extracted Metadata Preview */}
                        {extractedData && !extracting && (
                            <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-5 space-y-4 animate-slide-up">
                                <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
                                    <span className="text-emerald-400 text-sm">✅</span>
                                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Extracted Metadata</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Parcel Number</p>
                                        <p className="text-sm text-slate-200 font-mono font-bold tracking-tighter italic">{extractedData.parcelNumber}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">County</p>
                                        <p className="text-sm text-slate-200 font-bold italic">{extractedData.county || "UNKNOWN"}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Registered Owner</p>
                                        <p className="text-sm text-slate-200 font-bold italic">{extractedData.ownerName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Land Area</p>
                                        <p className="text-sm text-slate-200 font-bold italic">{extractedData.area} Hectares</p>
                                    </div>
                                </div>

                                <p className="text-[10px] text-emerald-500/60 pt-2 italic text-center">
                                    Please verify these details match your document before submitting.
                                </p>
                            </div>
                        )}

                        {/* Notes (optional) - The only manual field remains */}
                        <div className="form-group">
                            <label htmlFor="notes" className="label">
                                Comments / Notes <span className="text-slate-500 font-normal ml-1">(optional)</span>
                            </label>
                            <textarea
                                id="notes"
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Describe the property location or additional details..."
                                className="input resize-none"
                                maxLength={500}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowPaymentModal(true)}
                            disabled={loading || extracting || !extractedData}
                            className="btn-primary w-full py-4 text-base font-bold shadow-lg shadow-blue-500/10"
                        >
                            {loading ? (
                                <>
                                    <span className="shrink-0 w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                    Proceed to Payment
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* M-Pesa Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="card-elevated w-full max-w-md p-8 relative overflow-hidden shadow-2xl border-slate-700/50">
                        {/* Close Button — always visible */}
                        <button
                            onClick={closePaymentModal}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        {/* TitleGuard Logo/Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                                <span className="text-3xl">🛡️</span>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
                            <div className="inline-block px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 mb-2">
                                <span className="text-2xl font-bold text-emerald-400">KES 5</span>
                            </div>
                            <p className="text-slate-400 text-sm">Document Registration Fee</p>
                        </div>

                        {paymentStatus === "idle" && (
                            <form onSubmit={handleInitiatePayment} className="space-y-6">
                                <div>
                                    <label className="label">M-Pesa Phone Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="e.g. 0712345678"
                                        className="input text-center text-lg tracking-widest font-mono"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-2 text-center uppercase tracking-wider">
                                        You will receive an STK Push prompt on this phone
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closePaymentModal}
                                        className="btn-outline flex-1 py-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={paymentLoading}
                                        className="btn-primary flex-1 py-3"
                                    >
                                        {paymentLoading ? "Requesting..." : "Pay Now"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {paymentStatus === "pending" && (
                            <div className="text-center py-10 space-y-6">
                                <div className="relative mx-auto w-20 h-20">
                                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="absolute inset-0 flex items-center justify-center text-2xl">📱</span>
                                </div>
                                <div>
                                    <p className="text-white font-bold mb-1">Check your phone</p>
                                    <p className="text-slate-400 text-sm leading-relaxed px-4">
                                        Enter your M-Pesa PIN on <strong>{phone}</strong> to confirm the payment of <strong>KES 5</strong>.
                                    </p>
                                </div>
                                <div className="px-4 py-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 inline-block uppercase font-bold tracking-tighter">
                                    Waiting for confirmation...
                                </div>
                            </div>
                        )}

                        {paymentStatus === "completed" && (
                            <div className="text-center py-10 space-y-4 animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">Payment Confirmed!</h3>
                                <p className="text-slate-400 text-sm">Proceeding with document registration...</p>
                            </div>
                        )}

                        {paymentStatus === "processing" && (
                            <div className="text-center py-10 space-y-6 animate-in fade-in duration-300">
                                <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-3xl">⏳</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Payment Pending</h3>
                                    <p className="text-slate-400 text-sm mt-1 px-4 leading-relaxed">
                                        We are still waiting for confirmation from M-Pesa. You will receive an SMS once the payment is processed.
                                    </p>
                                </div>
                                <button
                                    onClick={closePaymentModal}
                                    className="btn-primary w-full py-3"
                                >
                                    Done
                                </button>
                            </div>
                        )}

                        {paymentStatus === "failed" && (
                            <div className="text-center py-10 space-y-6">
                                <div className="w-20 h-20 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-4xl text-red-500">❌</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {modalError ? "Registration Failed" : "Payment Failed"}
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {modalError || "The transaction could not be completed. Please try again."}
                                    </p>
                                </div>
                                {!modalError && (
                                    <button
                                        onClick={() => { setPaymentStatus("idle"); setModalError(""); }}
                                        className="btn-primary w-full py-3"
                                    >
                                        Try Again
                                    </button>
                                )}
                                <button
                                    onClick={closePaymentModal}
                                    className="text-slate-500 hover:text-white text-xs uppercase font-bold"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UploadDocument;

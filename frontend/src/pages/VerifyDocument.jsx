import { useState, useRef } from "react";
import api from "../api/axios";

const TABS = [
    { id: "file", label: "Upload File" },
    { id: "id", label: "Verification ID" },
];

function ResultCard({ result }) {
    const isAuthentic = result.authentic || result.found;
    const isTampered = result.tampered;

    const color = isAuthentic
        ? "emerald"
        : isTampered
            ? "amber"
            : "red";

    const icon = isAuthentic ? "✅" : isTampered ? "⚠️" : "❌";

    const colorMap = {
        emerald: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
        amber: "bg-amber-500/10 border-amber-500/40 text-amber-400",
        red: "bg-red-500/10 border-red-500/40 text-red-400",
    };

    return (
        <div className={`rounded-xl border p-6 animate-slide-up ${colorMap[color]}`}>
            <div className="flex items-start gap-4 mb-5">
                <span className="text-3xl">{icon}</span>
                <div>
                    <h3 className="text-lg font-bold">
                        {isAuthentic
                            ? "AUTHENTIC"
                            : isTampered
                                ? "TAMPERED"
                                : "NOT REGISTERED"}
                    </h3>
                    <p className="text-sm mt-1 opacity-80">{result.message}</p>
                </div>
            </div>

            {result.data && (
                <div className="bg-slate-900/60 rounded-lg p-4 space-y-2.5 text-sm border border-slate-700/40">
                    {result.data.parcelNumber && (
                        <Row label="Parcel Number" value={result.data.parcelNumber} mono />
                    )}
                    {result.data.verificationId && (
                        <Row label="Verification ID" value={result.data.verificationId} mono />
                    )}
                    {result.data.fileName && (
                        <Row label="File Name" value={result.data.fileName} />
                    )}
                    {result.data.registeredAt && (
                        <Row
                            label="Registered On"
                            value={new Date(result.data.registeredAt).toLocaleDateString("en-KE", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        />
                    )}
                    {result.data.registeredBy && (
                        <Row label="Registered By" value={result.data.registeredBy} />
                    )}
                    {result.data.documentHash && (
                        <Row
                            label="Document Hash"
                            value={result.data.documentHash.slice(0, 40) + "…"}
                            mono
                        />
                    )}
                    {result.data.computedHash && !result.data.documentHash && (
                        <Row
                            label="Computed Hash"
                            value={result.data.computedHash.slice(0, 40) + "…"}
                            mono
                        />
                    )}

                    {/* Extracted Metadata Side-by-Side (if available) */}
                    {(result.data.metadata || result.data.extractedMetadata) && (
                        <div className="mt-4 pt-4 border-t border-slate-700/60">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Data Extracted from Uploaded File</h4>
                            <div className="grid grid-cols-2 gap-4 bg-slate-800/40 p-3 rounded-lg border border-slate-700/30">
                                <DetailItem
                                    label="Owner"
                                    value={(result.data.metadata || result.data.extractedMetadata).ownerName}
                                />
                                <DetailItem
                                    label="Parcel #"
                                    value={(result.data.metadata || result.data.extractedMetadata).parcelNumber}
                                    mono
                                />
                                <DetailItem
                                    label="County"
                                    value={(result.data.metadata || result.data.extractedMetadata).county}
                                />
                                <DetailItem
                                    label="Area"
                                    value={(result.data.metadata || result.data.extractedMetadata).area ? `${(result.data.metadata || result.data.extractedMetadata).area} Ha` : null}
                                />
                            </div>
                        </div>
                    )}

                    {/* REGISTRY DETAILS PANEL */}
                    {result.registryStatus && (
                        <div className={`mt-6 rounded-lg p-5 border-l-4 ${result.registryStatus === 'verified'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : result.registryStatus === 'flagged'
                                ? 'bg-red-500/10 border-red-500 text-red-400'
                                : 'bg-amber-500/10 border-amber-500 text-amber-400'
                            }`}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">
                                    {result.registryStatus === 'verified' ? '✅' : result.registryStatus === 'flagged' ? '🚨' : '⚠️'}
                                </span>
                                <h4 className="font-bold uppercase tracking-tight">
                                    {result.registryStatus === 'verified' && 'Registry Verified'}
                                    {result.registryStatus === 'flagged' && 'Fraud Detected'}
                                    {result.registryStatus === 'unverified' && 'Not in Registry'}
                                </h4>
                            </div>

                            <p className="text-xs mb-4 opacity-90 leading-relaxed">
                                {result.registryMessage}
                            </p>

                            {result.registryRecord && (
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-white/10">
                                    <DetailItem label="Title Number" value={result.registryRecord.titleNumber} />
                                    <DetailItem label="County" value={result.registryRecord.county} />
                                    <DetailItem label="Area" value={result.registryRecord.area} />
                                    <DetailItem label="Land Use" value={result.registryRecord.landUse} />
                                    <DetailItem label="Tenure" value={result.registryRecord.tenure} />
                                    <DetailItem label="Date Issued" value={result.registryRecord.dateIssued} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function DetailItem({ label, value, mono }) {
    if (!value) return null;
    return (
        <div className="space-y-0.5">
            <p className="text-[9px] text-slate-500 uppercase font-bold">{label}</p>
            <p className={`text-xs text-slate-200 truncate ${mono ? "font-mono" : ""}`}>{value}</p>
        </div>
    );
}

function Row({ label, value, mono }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-slate-500 text-xs">{label}</span>
            <span className={`text-slate-200 break-all ${mono ? "font-mono text-xs" : "text-sm"}`}>
                {value}
            </span>
        </div>
    );
}

function VerifyDocument() {
    const [activeTab, setActiveTab] = useState("file");
    const [file, setFile] = useState(null);
    const [parcelNumber, setParcelNumber] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const fileRef = useRef(null);

    // M-Pesa Payment States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [phone, setPhone] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, pending, completed, failed
    const [checkoutRequestID, setCheckoutRequestID] = useState("");
    const [pendingAction, setPendingAction] = useState(null); // 'file' or 'id'
    const [modalError, setModalError] = useState("");

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setPaymentStatus("idle");
        setModalError("");
    };

    const reset = () => {
        setResult(null);
        setError("");
        setFile(null);
        setParcelNumber("");
        setVerificationId("");
    };

    const handleFileVerify = async (e) => {
        if (e) e.preventDefault(); // Guard: may be called without event from payment polling
        if (!file) { setError("Please select a file to verify."); return; }
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const form = new FormData();
            form.append("document", file);
            if (parcelNumber.trim()) form.append("parcelNumber", parcelNumber.trim());
            const { data } = await api.post("/verify/file", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(data);
            setShowPaymentModal(false);
            setPaymentStatus("idle");
        } catch (err) {
            // Surface error inside the modal so the user isn't stuck
            const msg = err.response?.data?.message || "Verification failed. Please try again.";
            setModalError(msg);
            setPaymentStatus("failed");
        } finally {
            setLoading(false);
            setPaymentLoading(false);
        }
    };

    const handleIdVerify = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const { data } = await api.get(`/verify/${verificationId.trim()}`);
            setResult(data);
            setShowPaymentModal(false);
            setPaymentStatus("idle");
        } catch (err) {
            if (err.response?.status === 404) {
                setResult({ found: false, message: "No document found with this verification ID." });
                setShowPaymentModal(false);
                setPaymentStatus("idle");
            } else {
                // Surface error inside the modal so the user isn't stuck
                const msg = err.response?.data?.message || "Lookup failed. Please try again.";
                setModalError(msg);
                setPaymentStatus("failed");
            }
        } finally {
            setLoading(false);
            setPaymentLoading(false);
        }
    };

    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        setPaymentLoading(true);
        setError("");

        try {
            const { data } = await api.post("/mpesa/initiate", {
                phone,
                purpose: "verification"
            });

            setCheckoutRequestID(data.checkoutRequestID);
            setPaymentStatus("sent");
            setPaymentLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to initiate payment.");
            setPaymentLoading(false);
        }
    };

    return (
        <div className="page-wrapper py-10 px-4">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="section-heading">Verify a Document</h1>
                    <p className="section-subheading">
                        Check if a title deed is authentic or has been tampered with.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl mb-6 border border-slate-700/50">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); reset(); }}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.id
                                ? "bg-accent-600 text-white shadow-sm"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="card-elevated p-8">
                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                            <span className="shrink-0">⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* ── Tab: Upload File ────────────────────────────────────────── */}
                    {activeTab === "file" && (
                        <form onSubmit={handleFileVerify} className="space-y-5">
                            {/* File picker */}
                            <div className="form-group">
                                <label className="label">Select Document to Verify</label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all duration-200 ${file
                                        ? "border-accent-500/60 bg-accent-500/5"
                                        : "border-slate-600 hover:border-slate-500 bg-slate-800/30"
                                        }`}
                                >
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => { setFile(e.target.files[0]); setError(""); }}
                                    />
                                    {file ? (
                                        <div>
                                            <p className="text-accent-300 font-medium text-sm">{file.name}</p>
                                            <p className="text-slate-500 text-xs mt-1">Click to change</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-3xl mb-2">🔍</div>
                                            <p className="text-slate-300 text-sm">Click to select document</p>
                                            <p className="text-slate-500 text-xs mt-1">PDF, JPG, PNG</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Optional parcel number for tamper detection */}
                            <div className="form-group">
                                <label htmlFor="parcelVer" className="label">
                                    Parcel Number{" "}
                                    <span className="text-slate-500 font-normal">(optional — helps detect tampering)</span>
                                </label>
                                <input
                                    id="parcelVer"
                                    type="text"
                                    value={parcelNumber}
                                    onChange={(e) => setParcelNumber(e.target.value)}
                                    placeholder="LOC/1234/567"
                                    className="input font-mono uppercase"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!file) { setError("Please select a file to verify."); return; }
                                    setPendingAction('file');
                                    setShowPaymentModal(true);
                                }}
                                disabled={loading || !file}
                                className="btn-primary w-full py-3 text-base"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing…
                                    </>
                                ) : (
                                    "Proceed to Payment"
                                )}
                            </button>
                        </form>
                    )}

                    {/* ── Tab: Verification ID ────────────────────────────────────── */}
                    {activeTab === "id" && (
                        <form onSubmit={handleIdVerify} className="space-y-5">
                            <div className="form-group">
                                <label htmlFor="verificationId" className="label">
                                    Verification ID (UUID)
                                </label>
                                <input
                                    id="verificationId"
                                    type="text"
                                    value={verificationId}
                                    onChange={(e) => { setVerificationId(e.target.value); setError(""); }}
                                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    className="input font-mono text-sm"
                                    required
                                />
                                <p className="text-slate-500 text-xs mt-1">
                                    The verification ID is provided when a document is registered.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!verificationId.trim()) { setError("Please enter a verification ID."); return; }
                                    setPendingAction('id');
                                    setShowPaymentModal(true);
                                }}
                                disabled={loading || !verificationId.trim()}
                                className="btn-primary w-full py-3 text-base"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing…
                                    </>
                                ) : (
                                    "Proceed to Payment"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="mt-6">
                            <ResultCard result={result} />
                            <button
                                onClick={reset}
                                className="btn-outline w-full mt-4 text-sm py-2.5"
                            >
                                Verify Another Document
                            </button>
                        </div>
                    )}
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
                                <span className="text-2xl font-bold text-emerald-400">KES 1</span>
                            </div>
                            <p className="text-slate-400 text-sm">Document Verification Fee</p>
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

                        {paymentStatus === "sent" && (
                            <div className="text-center py-10 space-y-6 animate-in fade-in duration-300">
                                <div className="w-20 h-20 bg-blue-500/20 border border-blue-500/40 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-3xl">📱</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">M-Pesa Prompt Sent</h3>
                                    <p className="text-slate-400 text-sm mt-1 px-4 leading-relaxed">
                                        Please check your phone (<strong>{phone}</strong>) and enter your M-Pesa PIN to complete the payment.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={pendingAction === 'file' ? handleFileVerify : handleIdVerify}
                                        className="btn-primary w-full py-3"
                                    >
                                        I've Paid, Verify Now
                                    </button>
                                    <button
                                        onClick={closePaymentModal}
                                        className="text-slate-500 hover:text-white text-xs uppercase font-bold w-full"
                                    >
                                        I'll pay later
                                    </button>
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
                                <p className="text-slate-400 text-sm">Proceeding with verification...</p>
                            </div>
                        )}

                        {paymentStatus === "failed" && (
                            <div className="text-center py-10 space-y-6">
                                <div className="w-20 h-20 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-4xl text-red-500">❌</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {modalError ? "Verification Failed" : "Payment Failed"}
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

export default VerifyDocument;

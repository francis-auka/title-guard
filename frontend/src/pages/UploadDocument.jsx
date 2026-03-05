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
    const [parcelNumber, setParcelNumber] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [county, setCounty] = useState("");
    const [area, setArea] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [metadataConflict, setMetadataConflict] = useState(null);
    const [result, setResult] = useState(null);

    const handleFileChange = (f) => {
        setError("");
        setMetadataConflict(null);
        if (!f) return;
        if (!ALLOWED_TYPES.includes(f.type)) {
            setError("Unsupported file type. Please upload a PDF, JPG, or PNG.");
            return;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
            return;
        }
        setFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMetadataConflict(null);

        if (!file) { setError("Please select a document file."); return; }
        if (!parcelNumber.trim()) { setError("Parcel number is required."); return; }
        if (!ownerName.trim()) { setError("Owner name is required."); return; }
        if (!county.trim()) { setError("County is required."); return; }
        if (!area.trim() || isNaN(area)) { setError("Valid land area is required."); return; }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("document", file);
            formData.append("parcelNumber", parcelNumber.trim());
            formData.append("ownerName", ownerName.trim());
            formData.append("county", county.trim());
            formData.append("area", area.trim());
            formData.append("notes", notes.trim());

            const { data } = await api.post("/documents/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (data.success) {
                setResult(data.data);
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
                                    setParcelNumber("");
                                    setOwnerName("");
                                    setCounty("");
                                    setArea("");
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
                    <h1 className="section-heading">Register a Title Deed</h1>
                    <p className="section-subheading">
                        Upload your property document to generate a tamper-proof blockchain record.
                    </p>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-accent-600/10 border border-accent-600/30 mb-6">
                    <span className="text-accent-400 mt-0.5 text-lg">ℹ️</span>
                    <p className="text-accent-300 text-sm">
                        Your file is <strong>never stored</strong> on our servers. Only its cryptographic hash is
                        registered on the blockchain.
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
                            <label className="label">Title Deed Document</label>
                            <FileDropZone file={file} onFileChange={handleFileChange} />
                        </div>

                        {/* Owner Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group md:col-span-2">
                                <label htmlFor="ownerName" className="label">Full Name of Owner</label>
                                <input
                                    id="ownerName"
                                    type="text"
                                    value={ownerName}
                                    onChange={(e) => { setOwnerName(e.target.value); setError(""); setMetadataConflict(null); }}
                                    placeholder="e.g. JOHN DOE MURAGE"
                                    className="input uppercase"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="county" className="label">County</label>
                                <input
                                    id="county"
                                    type="text"
                                    value={county}
                                    onChange={(e) => { setCounty(e.target.value); setError(""); setMetadataConflict(null); }}
                                    placeholder="e.g. NAIROBI"
                                    className="input uppercase"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="area" className="label">Area (approx. hectares)</label>
                                <input
                                    id="area"
                                    type="number"
                                    step="0.0001"
                                    value={area}
                                    onChange={(e) => { setArea(e.target.value); setError(""); setMetadataConflict(null); }}
                                    placeholder="0.045"
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Parcel number */}
                        <div className="form-group">
                            <label htmlFor="parcelNumber" className="label">
                                Land Parcel Number
                                <span className="text-slate-500 font-normal ml-1">(e.g. LOC/1234/567)</span>
                            </label>
                            <input
                                id="parcelNumber"
                                type="text"
                                value={parcelNumber}
                                onChange={(e) => { setParcelNumber(e.target.value); setError(""); setMetadataConflict(null); }}
                                placeholder="LOC/1234/567"
                                className="input font-mono uppercase"
                                required
                            />
                        </div>

                        {/* Notes (optional) */}
                        <div className="form-group">
                            <label htmlFor="notes" className="label">
                                Notes <span className="text-slate-500 font-normal">(optional)</span>
                            </label>
                            <textarea
                                id="notes"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. Plot in Westlands, Nairobi…"
                                className="input resize-none"
                                maxLength={500}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="btn-primary w-full py-3 text-base"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Registering on blockchain…
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                    Register Title Deed
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UploadDocument;

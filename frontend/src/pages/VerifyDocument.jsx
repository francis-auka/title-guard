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

    const reset = () => {
        setResult(null);
        setError("");
        setFile(null);
        setParcelNumber("");
        setVerificationId("");
    };

    const handleFileVerify = async (e) => {
        e.preventDefault();
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
        } catch (err) {
            setError(err.response?.data?.message || "Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleIdVerify = async (e) => {
        e.preventDefault();
        if (!verificationId.trim()) { setError("Please enter a verification ID."); return; }
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const { data } = await api.get(`/verify/${verificationId.trim()}`);
            setResult(data);
        } catch (err) {
            if (err.response?.status === 404) {
                setResult({ found: false, message: "No document found with this verification ID." });
            } else {
                setError(err.response?.data?.message || "Lookup failed. Please try again.");
            }
        } finally {
            setLoading(false);
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
                                type="submit"
                                disabled={loading || !file}
                                className="btn-primary w-full py-3 text-base"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Verifying…
                                    </>
                                ) : (
                                    "Verify Document"
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
                                type="submit"
                                disabled={loading || !verificationId.trim()}
                                className="btn-primary w-full py-3 text-base"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Looking up…
                                    </>
                                ) : (
                                    "Look Up Document"
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
        </div>
    );
}

export default VerifyDocument;

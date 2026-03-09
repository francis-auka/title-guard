import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function ConfirmTransfer() {
    const { token } = useParams();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchTransferDetails = async () => {
            try {
                const { data } = await api.get(`/transfer/confirm/${token}`);
                if (data.success) {
                    setDoc(data.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Invalid or expired transfer link.");
            } finally {
                setLoading(false);
            }
        };

        fetchTransferDetails();
    }, [token]);

    const handleConfirm = async () => {
        setConfirmLoading(true);
        setError("");
        try {
            const { data } = await api.post(`/transfer/complete/${token}`, {
                confirmedByName: doc.toName,
                confirmedByEmail: doc.toEmail
            });

            if (data.success) {
                setSuccess(`✅ Transfer Complete! You are now the registered owner of ${doc.parcelNumber}. A confirmation has been sent to your email.`);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to complete transfer.");
        } finally {
            setConfirmLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="page-wrapper py-20 flex items-center justify-center">
            <div className="container-narrow w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">🏷️ Property Transfer</h1>
                    <p className="text-slate-400">TitleGuard Secure Asset Transfer</p>
                </div>

                {success ? (
                    <div className="card p-8 text-center border-emerald-500/30 bg-emerald-500/5 anim-fade-in">
                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Transfer Successful!</h2>
                        <p className="text-slate-300 mb-8 leading-relaxed">
                            {success}
                        </p>
                        <a href="/" className="btn-primary inline-flex items-center gap-2">
                            Go to Homepage
                        </a>
                    </div>
                ) : (
                    <div className="card p-8 border-slate-700 shadow-2xl relative overflow-hidden anim-slide-up">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-accent-600" />

                        {error ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Transfer Error</h3>
                                <p className="text-red-400 text-sm mb-8">{error}</p>
                                <a href="/" className="btn-outline btn-block py-2.5">Return Home</a>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-white mb-1">Confirm Acceptance</h2>
                                    <p className="text-slate-400 text-sm">Review the property details below before accepting.</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Parcel Number</p>
                                        <p className="text-lg font-mono font-bold text-accent-300">{doc.parcelNumber}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-800/20 p-3 rounded border border-slate-700/30">
                                            <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Transferring From</p>
                                            <p className="text-slate-200 text-sm font-semibold">{doc.ownerName}</p>
                                        </div>
                                        <div className="bg-slate-800/20 p-3 rounded border border-slate-700/30">
                                            <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Transferring To</p>
                                            <p className="text-slate-200 text-sm font-semibold">{doc.toName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs px-1 border-t border-slate-700/50 pt-4">
                                        <span className="text-slate-500 uppercase font-bold">County</span>
                                        <span className="text-slate-300">{doc.county}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs px-1">
                                        <span className="text-slate-500 uppercase font-bold">Area Size</span>
                                        <span className="text-slate-300">{doc.area} Hectares</span>
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-8">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs text-blue-200 leading-relaxed">
                                            By clicking the button below, this property deed will be legally recorded on the blockchain in your name. This process is permanent and irreversible.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirm}
                                    disabled={confirmLoading}
                                    className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-blue-900/40 relative group overflow-hidden"
                                >
                                    {confirmLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Updating Blockchain...
                                        </span>
                                    ) : (
                                        "Accept & Confirm Transfer"
                                    )}
                                </button>

                                <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-tighter">
                                    Secure Transfer Powered by TitleGuard Smart Contracts
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConfirmTransfer;

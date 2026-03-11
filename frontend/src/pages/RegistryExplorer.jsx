import { useEffect, useState } from "react";
import api from "../api/axios";

function RegistryExplorer() {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchRegistry = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/registry/all");
            setRecords(data);
            setFilteredRecords(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load registry records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistry();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = records.filter(
            (r) =>
                r.parcelNumber.toLowerCase().includes(query) ||
                r.ownerName.toLowerCase().includes(query)
        );
        setFilteredRecords(filtered);
    }, [searchQuery, records]);

    return (
        <div className="page-wrapper py-10">
            <div className="container-wide">
                <div className="mb-8">
                    <h1 className="section-heading">Kenya Land Registry — Simulation</h1>
                    <p className="section-subheading">
                        This is a simulated registry for demonstration purposes. In production,
                        TitleGuard integrates with the official Ardhisasa land registry.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by Parcel Number or Owner..."
                            className="input-field pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="px-4 py-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        ⚠️ {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase font-bold tracking-wider">
                                    <th className="px-4 py-2">Parcel Number</th>
                                    <th className="px-4 py-2">Owner Name</th>
                                    <th className="px-4 py-2">County</th>
                                    <th className="px-4 py-2">Area (Ha)</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">On TitleGuard</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((record) => (
                                    <tr key={record._id} className="bg-slate-900/50 hover:bg-slate-800/80 transition-colors border border-slate-800 rounded-lg group">
                                        <td className="px-4 py-4 rounded-l-lg border-y border-l border-slate-800 group-hover:border-slate-700">
                                            <code className="text-emerald-400 font-mono text-sm">{record.parcelNumber}</code>
                                        </td>
                                        <td className="px-4 py-4 border-y border-slate-800 group-hover:border-slate-700">
                                            <span className="text-slate-200 font-medium">{record.ownerName}</span>
                                        </td>
                                        <td className="px-4 py-4 border-y border-slate-800 group-hover:border-slate-700 text-slate-400 text-sm">
                                            {record.county}
                                        </td>
                                        <td className="px-4 py-4 border-y border-slate-800 group-hover:border-slate-700 text-slate-400 text-sm">
                                            {record.area}
                                        </td>
                                        <td className="px-4 py-4 border-y border-slate-800 group-hover:border-slate-700">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${record.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 rounded-r-lg border-y border-r border-slate-800 group-hover:border-slate-700">
                                            {record.registeredOnTitleGuard ? (
                                                <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 text-xs font-medium italic">No</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredRecords.length === 0 && (
                            <div className="text-center py-10 card">
                                <p className="text-slate-500">No matching records found in registry.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegistryExplorer;

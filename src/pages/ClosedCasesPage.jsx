import React, { useState, useEffect } from 'react';
import { getTransfersByStatus } from '../api/ngo';
import TransferCard from '../components/TransferCard';
import TransferDetailsModal from '../components/TransferDetailsModal';
import { CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

// NgoTransfer status 'closed' = case fully resolved and archived.

const Skeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex h-44">
        <div className="w-44 bg-slate-200 shrink-0" />
        <div className="flex-1 p-5 space-y-3">
          <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
          <div className="h-3 bg-slate-200 rounded-lg w-3/4" />
          <div className="h-3 bg-slate-200 rounded-lg w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

// Inline severity filter — no abstraction needed at this scale.
const SEVERITY_OPTIONS = ['All', 'Critical', 'High', 'Medium', 'Low'];

const ClosedCasesPage = () => {
  const [cases, setCases]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]       = useState('All');
  const [detailTransfer, setDetailTransfer] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransfersByStatus('closed');
      if (data.success) setCases(data.transfers || []);
      else setError('Failed to load closed cases. Please try again.');
    } catch (err) {
      setError(err.message || 'An error occurred fetching closed cases.');
    } finally {
      setIsLoading(false);
    }
  };

  const visible = filter === 'All'
    ? cases
    : cases.filter((c) => c.reportId?.severity === filter);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Closed Cases</h1>
          <p className="text-slate-500 text-sm mt-1">
            Resolved and archived rescue cases handled by your NGO.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && !error && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {cases.length} resolved
            </span>
          )}
          <button
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Severity filter tabs — only shown when we have data */}
      {!isLoading && !error && cases.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                filter === opt
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {opt}
              {opt !== 'All' && (
                <span className="ml-1.5 opacity-60">
                  ({cases.filter((c) => c.reportId?.severity === opt).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && <Skeleton />}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-semibold">Failed to load closed cases</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={load}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state — no closed cases at all */}
      {!isLoading && !error && cases.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
          <p className="font-semibold text-slate-700 text-lg">No closed cases yet</p>
          <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
            Cases that have been fully resolved and closed will appear here for your records.
          </p>
        </div>
      )}

      {/* Empty state — filter returned nothing */}
      {!isLoading && !error && cases.length > 0 && visible.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center text-center">
          <p className="font-semibold text-slate-700">No {filter} severity cases</p>
          <p className="text-slate-400 text-sm mt-1">Try a different filter.</p>
          <button
            onClick={() => setFilter('All')}
            className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Cases list — read-only, shows closure details */}
      {!isLoading && !error && visible.length > 0 && (
        <div className="space-y-4">
          {visible.map((c) => (
            <TransferCard
              key={c._id}
              transfer={c}
              mode="closed"
              onViewDetails={setDetailTransfer}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detailTransfer && (
        <TransferDetailsModal
          transfer={detailTransfer}
          onClose={() => setDetailTransfer(null)}
        />
      )}

    </main>
  );
};

export default ClosedCasesPage;

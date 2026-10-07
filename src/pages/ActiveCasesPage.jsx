import React, { useState, useEffect } from 'react';
import { getTransfersByStatus } from '../api/ngo';
import TransferCard from '../components/TransferCard';
import TransferDetailsModal from '../components/TransferDetailsModal';
import CloseCaseModal from '../components/CloseCaseModal';
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';

// NgoTransfer status 'accepted' = active case (animal in care, volunteer assigned).

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

const ActiveCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailTransfer, setDetailTransfer] = useState(null);
  const [closeTransferId, setCloseTransferId] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // status=accepted maps to active cases in NgoTransfer enum.
      const data = await getTransfersByStatus('accepted');
      if (data.success) setCases(data.transfers || []);
      else setError('Failed to load active cases. Please try again.');
    } catch (err) {
      setError(err.message || 'An error occurred fetching active cases.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = (id) => {
    setCloseTransferId(null);
    // Remove the closed case from the active cases list immediately
    setCases(prev => prev.filter(c => c._id !== id));
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Active Cases</h1>
          <p className="text-slate-500 text-sm mt-1">
            Rescue cases currently accepted and being handled by your NGO.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && !error && (
            <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {cases.length} active
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

      {/* Loading */}
      {isLoading && <Skeleton />}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-semibold">Failed to load active cases</p>
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

      {/* Empty state */}
      {!isLoading && !error && cases.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-amber-500" />
          </div>
          <p className="font-semibold text-slate-700 text-lg">No active cases</p>
          <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
            Cases your NGO has accepted will appear here. Accept transfer requests from the Pending Transfers page to get started.
          </p>
        </div>
      )}

      {/* Cases list — read-only, no accept/reject actions */}
      {!isLoading && !error && cases.length > 0 && (
        <div className="space-y-4">
          {cases.map((c) => (
            <TransferCard
              key={c._id}
              transfer={c}
              mode="active"
              onViewDetails={setDetailTransfer}
              onCloseCase={setCloseTransferId}
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

      {/* Close case modal */}
      {closeTransferId && (
        <CloseCaseModal
          transferId={closeTransferId}
          onClose={() => setCloseTransferId(null)}
          onSuccess={handleCloseSuccess}
        />
      )}
    </main>
  );
};

export default ActiveCasesPage;

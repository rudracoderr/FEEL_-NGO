import React, { useState, useEffect } from 'react';
import { getPendingTransfers, acceptTransfer } from '../api/ngo';
import TransferCard from '../components/TransferCard';
import RejectTransferModal from '../components/RejectTransferModal';
import TransferDetailsModal from '../components/TransferDetailsModal';
import { Inbox, RefreshCw, AlertCircle } from 'lucide-react';

// ── Loading skeleton ─────────────────────────────────────────────────────────
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

const PendingTransfersPage = () => {
  const [transfers, setTransfers]       = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [detailTransfer, setDetailTransfer] = useState(null);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPendingTransfers();
      if (data.success) setTransfers(data.transfers || []);
      else setError('Failed to load transfers. Please try again.');
    } catch (err) {
      setError(err.message || 'An error occurred fetching transfers.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setActionLoadingId(id);
    try {
      const data = await acceptTransfer(id);
      if (data.success) setTransfers((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to accept transfer.');
      // ponytail: a 409 here is always terminal (orphaned/resolved/cancelled).
      // Remove the stale card so the NGO isn't stuck retrying an invalid action.
      // acceptTransfer throws Error("Failed to accept transfer (409)") — no err.status.
      if (err.message?.includes('(409)')) {
        setTransfers((prev) => prev.filter((t) => t._id !== id));
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open the reject modal — the modal handles the API call internally.
  const openRejectModal = (id) => setRejectTargetId(id);

  // Called by RejectTransferModal after a successful rejection.
  const handleRejectSuccess = (id) => {
    setTransfers((prev) => prev.filter((t) => t._id !== id));
    setRejectTargetId(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Pending Transfers</h1>
          <p className="text-slate-500 text-sm mt-1">
            Transfer requests from volunteers waiting for your response.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && !error && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {transfers.length} pending
            </span>
          )}
          <button
            onClick={fetch}
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
            <p className="text-red-700 font-semibold">Failed to load transfers</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={fetch}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && transfers.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <Inbox size={24} className="text-amber-500" />
          </div>
          <p className="font-semibold text-slate-700 text-lg">No pending transfers</p>
          <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
            When volunteers request a case transfer to your NGO, they'll appear here for your review.
          </p>
        </div>
      )}

      {/* Transfer list */}
      {!isLoading && !error && transfers.length > 0 && (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <TransferCard
              key={transfer._id}
              transfer={transfer}
              mode="pending"
              onAccept={handleAccept}
              onReject={openRejectModal}
              onViewDetails={setDetailTransfer}
              isActionLoading={actionLoadingId === transfer._id}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTargetId && (
        <RejectTransferModal
          transferId={rejectTargetId}
          onClose={() => setRejectTargetId(null)}
          onSuccess={handleRejectSuccess}
        />
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

export default PendingTransfersPage;

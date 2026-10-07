import React, { useState, useEffect, useRef } from 'react';
import { rejectTransfer } from '../api/ngo';
import { XCircle, AlertTriangle, Loader2 } from 'lucide-react';

// Reusable reject modal — receives transferId and callbacks.
// Props:
//   transferId  – the NgoTransfer _id to reject
//   onClose     – called when user cancels or clicks backdrop
//   onSuccess   – called after successful rejection (parent should refresh list)

const RejectTransferModal = ({ transferId, onClose, onSuccess }) => {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  // Auto-focus the textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = remarks.trim();
    if (!trimmed) return;
    if (trimmed.length > 1000) return; // guard; submit button is disabled but belt-and-suspenders

    setIsSubmitting(true);
    setError(null);
    try {
      const data = await rejectTransfer(transferId, trimmed);
      if (data.success) {
        onSuccess(transferId);
      } else {
        setError(data.message || 'Rejection failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while rejecting the transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      {/* Modal card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-base leading-tight">
              Reject Transfer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors p-1 -mr-1"
            aria-label="Close"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-4">
            <label
              htmlFor="reject-remarks"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-remarks"
              ref={textareaRef}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isSubmitting}
              placeholder="Please explain why this transfer is being rejected…"
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-800 placeholder:text-slate-300 resize-none transition-all disabled:opacity-50 disabled:bg-slate-50"
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs text-slate-400">
                The volunteer will see this reason in their notification.
              </p>
              <p className={`text-xs tabular-nums ${remarks.trim().length > 950 ? 'text-red-500' : 'text-slate-400'}`}>
                {remarks.trim().length}/1000
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-500" />
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !remarks.trim() || remarks.trim().length > 1000}
              className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Rejecting…
                </>
              ) : (
                'Reject Transfer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectTransferModal;

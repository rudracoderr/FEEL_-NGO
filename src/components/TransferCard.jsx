import React from 'react';
import { MapPin, Clock, User, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

// NgoTransfer status enum: pending | accepted | rejected | cancelled | closed
// Report severity enum:    Low | Medium | High | Critical

const SEVERITY = {
  Low:      'bg-emerald-100 text-emerald-700',
  Medium:   'bg-amber-100   text-amber-700',
  High:     'bg-orange-100  text-orange-700',
  Critical: 'bg-red-100     text-red-700',
  low:      'bg-emerald-100 text-emerald-700',
  medium:   'bg-amber-100   text-amber-700',
  high:     'bg-orange-100  text-orange-700',
  critical: 'bg-red-100     text-red-700',
};

const fmt = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

// mode = 'pending' | 'active' | 'closed'
// onAccept / onReject only used in pending mode.
// onViewDetails — called with the full transfer object to open detail modal.
const TransferCard = ({ transfer, onAccept, onReject, onCloseCase, onViewDetails, isActionLoading, mode = 'pending' }) => {
  const report = transfer.reportId;
  if (!report) return null;

  const severity  = report.severity || transfer.condition?.severity || 'Low';
  const sevLabel  = typeof severity === 'string' ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Low';
  const image     = transfer.animalSnapshot?.imageUrls?.[0] || report.imageUrls?.[0];
  const address   = transfer.animalSnapshot?.address || report.address || report.location?.address || null;
  const volName   = transfer.transferredBy?.name || null;

  const handleCardClick = () => {
    if (onViewDetails) onViewDetails(transfer);
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${onViewDetails ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex flex-col md:flex-row">

        {/* Thumbnail */}
        {image ? (
          <img
            src={image}
            alt="Rescued animal"
            className="w-full md:w-44 h-44 md:h-auto object-cover shrink-0 bg-slate-100"
          />
        ) : (
          <div className="w-full md:w-44 h-36 md:h-auto bg-slate-100 shrink-0 flex items-center justify-center text-5xl select-none">
            🐾
          </div>
        )}

        {/* Body */}
        <div className="flex-1 p-5 flex flex-col gap-3 min-w-0">
          {/* Title + severity */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-base leading-tight">
              {report.title || 'Animal Rescue'}
            </h3>
            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${SEVERITY[severity] || SEVERITY[sevLabel] || SEVERITY.Low}`}>
              {sevLabel}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{report.description}</p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
            {address && (
              <span className="flex items-center gap-1">
                <MapPin size={11} className="shrink-0" />
                {address}
              </span>
            )}
            {transfer.requestedAt && (
              <span className="flex items-center gap-1">
                <Clock size={11} className="shrink-0" />
                Requested {fmt(transfer.requestedAt)}
              </span>
            )}
            {mode === 'active' && transfer.acceptedAt && (
              <span className="flex items-center gap-1 text-sky-600 font-medium">
                <CheckCircle2 size={11} className="shrink-0" />
                Accepted {fmt(transfer.acceptedAt)}
              </span>
            )}
            {mode === 'closed' && transfer.closedAt && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 size={11} className="shrink-0" />
                Closed {fmt(transfer.closedAt)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User size={11} className="shrink-0" />
              Vol: {volName || `${transfer.requestedByUid?.slice(0, 8)}…`}
            </span>
          </div>

          {/* Volunteer progress badge (active only) */}
          {mode === 'active' && report.volunteerProgress && (
            <span className="self-start text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full">
              {report.volunteerProgress}
            </span>
          )}

          {/* Volunteer remarks (pending / active) */}
          {transfer.remarks && (
            <div className="bg-slate-50 border-l-2 border-violet-300 px-3 py-2 rounded-r-xl text-sm text-slate-600 italic leading-relaxed">
              "{transfer.remarks}"
            </div>
          )}

          {/* Closure remarks (closed only) */}
          {mode === 'closed' && transfer.closureRemarks && (
            <div className="bg-emerald-50 border-l-2 border-emerald-400 px-3 py-2 rounded-r-xl text-sm text-slate-600 italic leading-relaxed">
              Resolution: "{transfer.closureRemarks}"
            </div>
          )}

          {/* View details hint */}
          {onViewDetails && (
            <span className="self-start flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors mt-auto">
              <Eye size={12} />
              View Details
            </span>
          )}
        </div>

        {/* Accept / Reject actions — pending mode only */}
        {mode === 'pending' && (
          <div
            className="flex md:flex-col gap-2 p-4 border-t md:border-t-0 md:border-l border-slate-100 justify-center items-center md:min-w-[136px] shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onAccept(transfer._id)}
              disabled={isActionLoading}
              className="flex-1 md:flex-none md:w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors"
            >
              {isActionLoading ? '…' : 'Accept'}
            </button>
            <button
              onClick={() => onReject(transfer._id)}
              disabled={isActionLoading}
              className="flex-1 md:flex-none md:w-full bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors border border-red-100"
            >
              {isActionLoading ? '…' : 'Reject'}
            </button>
          </div>
        )}

        {/* Close Case action — active mode only */}
        {mode === 'active' && onCloseCase && (
          <div
            className="flex md:flex-col gap-2 p-4 border-t md:border-t-0 md:border-l border-slate-100 justify-center items-center md:min-w-[136px] shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onCloseCase(transfer._id)}
              disabled={isActionLoading}
              className="flex-1 md:flex-none md:w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors shadow-sm"
            >
              {isActionLoading ? '…' : 'Close Case'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferCard;

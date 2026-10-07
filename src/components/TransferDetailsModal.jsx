import React, { useEffect } from 'react';
import {
  XCircle, MapPin, Clock, User, Phone, Mail,
  AlertTriangle, CheckCircle2, Building2, FileText,
  Stethoscope, Truck, Home, ChevronLeft, ChevronRight,
} from 'lucide-react';

// ── Severity styles (matches TransferCard) ────────────────────────────────────
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

const STATUS_STYLE = {
  pending:   'bg-amber-100   text-amber-700   border-amber-200',
  accepted:  'bg-sky-100     text-sky-700     border-sky-200',
  rejected:  'bg-red-100     text-red-600     border-red-200',
  cancelled: 'bg-slate-100   text-slate-600   border-slate-200',
  closed:    'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const fmt = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children }) => (
  <div>
    <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
      <Icon size={13} />
      {title}
    </h4>
    {children}
  </div>
);

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={14} className="text-slate-400 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700 font-medium break-words">{value}</p>
      </div>
    </div>
  );
};

// ── Need badge ────────────────────────────────────────────────────────────────
const NeedBadge = ({ icon: Icon, label, active }) => {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <Icon size={12} />
      {label}
    </span>
  );
};

// ── Image gallery ─────────────────────────────────────────────────────────────
const ImageGallery = ({ images }) => {
  const [idx, setIdx] = React.useState(0);
  if (!images || images.length === 0) return null;

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-100">
      <img
        src={images[idx]}
        alt={`Animal photo ${idx + 1}`}
        className="w-full h-56 md:h-72 object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((p) => (p - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setIdx((p) => (p + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Main component
// Props:
//   transfer – the full NgoTransfer object (with populated reportId)
//   onClose  – callback to close the modal
// ══════════════════════════════════════════════════════════════════════════════
const TransferDetailsModal = ({ transfer, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!transfer) return null;

  const report    = transfer.reportId || {};
  const animal    = transfer.animalSnapshot || {};
  const condition = transfer.condition || {};
  const reporter  = transfer.reporterSnapshot || {};
  const volunteer = transfer.transferredBy || {};
  const ngo       = transfer.ngoSnapshot || {};
  const acceptor  = transfer.acceptedBy || {};
  const rejector  = transfer.rejectedBy || {};

  // Merge image sources: animalSnapshot first, then report
  const images = (animal.imageUrls?.length ? animal.imageUrls : report.imageUrls) || [];

  // Severity from condition snapshot or report
  const severity = condition.severity || report.severity || null;
  const severityLabel = severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : null;

  // Address: animalSnapshot > report.address > report.location.address
  const address = animal.address || report.address || report.location?.address || null;

  // Description: animalSnapshot > report
  const description = animal.description || report.description || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-base leading-tight truncate">
                {report.title || animal.animalType || 'Transfer Details'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_STYLE[transfer.status] || STATUS_STYLE.pending}`}>
                  {transfer.status}
                </span>
                {severityLabel && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${SEVERITY[severity] || ''}`}>
                    {severityLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 shrink-0"
            aria-label="Close"
          >
            <XCircle size={22} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Images */}
          <ImageGallery images={images} />

          {/* Description */}
          {description && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          )}

          {/* Animal type */}
          {animal.animalType && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Animal Type:</span>
              <span className="text-sm font-medium text-slate-700 capitalize">{animal.animalType}</span>
            </div>
          )}

          {/* Condition / Needs */}
          {(condition.summary || condition.needsShelter || condition.needsTransport || condition.needsSurgery) && (
            <Section title="Condition Assessment" icon={Stethoscope}>
              {condition.summary && (
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{condition.summary}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <NeedBadge icon={Home}  label="Needs Shelter"   active={condition.needsShelter} />
                <NeedBadge icon={Truck} label="Needs Transport" active={condition.needsTransport} />
                <NeedBadge icon={Stethoscope} label="Needs Surgery" active={condition.needsSurgery} />
              </div>
            </Section>
          )}

          {/* Location */}
          {address && (
            <Section title="Location" icon={MapPin}>
              <p className="text-sm text-slate-700">{address}</p>
            </Section>
          )}

          {/* Timeline */}
          <Section title="Timeline" icon={Clock}>
            <div className="space-y-1">
              <InfoRow icon={Clock} label="Requested" value={fmt(transfer.requestedAt)} />
              <InfoRow icon={CheckCircle2} label="Accepted" value={fmt(transfer.acceptedAt)} />
              <InfoRow icon={AlertTriangle} label="Rejected" value={fmt(transfer.rejectedAt)} />
              <InfoRow icon={CheckCircle2} label="Closed" value={fmt(transfer.closedAt)} />
            </div>
          </Section>

          {/* Reporter */}
          {reporter.uid && (
            <Section title="Reporter" icon={User}>
              <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                <InfoRow icon={User}  label="Name"  value={reporter.name || 'Unknown'} />
                <InfoRow icon={Phone} label="Phone" value={reporter.phone} />
              </div>
            </Section>
          )}

          {/* Volunteer (who initiated transfer) */}
          {volunteer.uid && (
            <Section title="Volunteer (Transferred by)" icon={User}>
              <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                <InfoRow icon={User}  label="Name"  value={volunteer.name || 'Unknown'} />
                <InfoRow icon={Phone} label="Phone" value={volunteer.phone} />
              </div>
            </Section>
          )}

          {/* NGO */}
          {ngo.name && (
            <Section title="NGO" icon={Building2}>
              <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                <InfoRow icon={Building2} label="Name"  value={ngo.name} />
                <InfoRow icon={Phone}     label="Phone" value={ngo.phone} />
              </div>
            </Section>
          )}

          {/* Accepted by */}
          {acceptor.uid && (
            <Section title="Accepted by" icon={CheckCircle2}>
              <div className="bg-emerald-50 rounded-xl p-4 space-y-1">
                <InfoRow icon={User}  label="Name"  value={acceptor.name || 'Unknown'} />
                <InfoRow icon={Phone} label="Phone" value={acceptor.phone} />
              </div>
            </Section>
          )}

          {/* Rejected by */}
          {rejector.uid && (
            <Section title="Rejected by" icon={AlertTriangle}>
              <div className="bg-red-50 rounded-xl p-4 space-y-1">
                <InfoRow icon={User}  label="Name"  value={rejector.name || 'Unknown'} />
                <InfoRow icon={Phone} label="Phone" value={rejector.phone} />
              </div>
            </Section>
          )}

          {/* Remarks */}
          {transfer.remarks && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Volunteer Remarks</h4>
              <div className="bg-slate-50 border-l-2 border-violet-300 px-4 py-3 rounded-r-xl text-sm text-slate-600 italic leading-relaxed">
                "{transfer.remarks}"
              </div>
            </div>
          )}

          {/* Closure remarks */}
          {transfer.closureRemarks && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                {transfer.status === 'rejected' ? 'Rejection Reason' : 'Closure Remarks'}
              </h4>
              <div className={`border-l-2 px-4 py-3 rounded-r-xl text-sm text-slate-600 italic leading-relaxed ${
                transfer.status === 'rejected' ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-400'
              }`}>
                "{transfer.closureRemarks}"
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferDetailsModal;

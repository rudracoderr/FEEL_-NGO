import React, { useState, useEffect } from 'react';
import { getNgoProfile } from '../api/ngo';
import {
  Building2, Mail, Phone, MapPin, ShieldCheck,
  AlertCircle, RefreshCw, FolderOpen, AlertTriangle,
  CheckCircle2, Inbox,
} from 'lucide-react';

// NGO model fields: name, email, phone, address, verificationStatus,
//                   logoUrl, active, stats { totalCases, activeCases,
//                   recoveredAnimals, closedCases }

const VERIFICATION_STYLE = {
  verified: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Verified' },
  pending:  { cls: 'bg-amber-100  text-amber-700  border-amber-200',  label: 'Pending Verification' },
  rejected: { cls: 'bg-red-100   text-red-700   border-red-200',   label: 'Verification Rejected' },
};

const Skeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Profile card skeleton */}
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
          <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
          <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
        </div>
      </div>
    </div>
    {/* Stats skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-28 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-8 bg-slate-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  </div>
);

const NgoProfilePage = () => {
  const [ngo, setNgo]           = useState(null);
  const [user, setUser]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNgoProfile();
      if (data.success) {
        setNgo(data.ngo);
        setUser(data.user);
      } else {
        setError('Failed to load NGO profile. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred fetching your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = ngo
    ? [
        { label: 'Total Cases',       value: ngo.stats?.totalCases       ?? 0, icon: FolderOpen,   bg: 'bg-violet-50',  iconColor: 'text-violet-600'  },
        { label: 'Active Cases',       value: ngo.stats?.activeCases      ?? 0, icon: AlertTriangle, bg: 'bg-amber-50',   iconColor: 'text-amber-600'   },
        { label: 'Recovered Animals',  value: ngo.stats?.recoveredAnimals ?? 0, icon: CheckCircle2, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        { label: 'Closed Cases',       value: ngo.stats?.closedCases      ?? 0, icon: Inbox,        bg: 'bg-sky-50',     iconColor: 'text-sky-600'     },
      ]
    : [];

  // Initials avatar fallback when logoUrl is empty.
  const initials = ngo?.name
    ? ngo.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'NG';

  const verification = VERIFICATION_STYLE[ngo?.verificationStatus] || VERIFICATION_STYLE.pending;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-6 pb-12">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">NGO Profile</h1>
          <p className="text-slate-500 text-sm mt-1">
            Your organisation's details and performance summary.
          </p>
        </div>
        <button
          onClick={load}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {isLoading && <Skeleton />}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-semibold">Failed to load profile</p>
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

      {/* Empty / not linked state */}
      {!isLoading && !error && !ngo && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Building2 size={24} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700 text-lg">No NGO profile linked</p>
          <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
            Your account is not yet linked to an NGO. Please contact the FEEL admin to complete your organisation setup.
          </p>
        </div>
      )}

      {/* Profile content */}
      {!isLoading && !error && ngo && (
        <>
          {/* ── Organisation card ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Gradient banner */}
            <div className="h-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />
            <div className="px-8 pb-8">
              {/* Avatar + badge row */}
              <div className="flex items-end justify-between gap-4 -mt-10 mb-6 flex-wrap">
                <div className="flex items-end gap-4">
                  {ngo.logoUrl ? (
                    <img
                      src={ngo.logoUrl}
                      alt={ngo.name}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-slate-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center border-4 border-white shadow-md shrink-0">
                      <span className="text-white font-bold text-xl">{initials}</span>
                    </div>
                  )}
                  <div className="mb-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{ngo.name}</h2>
                    <span className={`inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${verification.cls}`}>
                      <ShieldCheck size={11} />
                      {verification.label}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${ngo.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {ngo.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Contact details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow icon={Mail}   label="Email"   value={ngo.email}           />
                <InfoRow icon={Phone}  label="Phone"   value={ngo.phone}           />
                <InfoRow icon={MapPin} label="Address" value={ngo.address || 'Not provided'} />
                {user && (
                  <InfoRow icon={Building2} label="Portal Role" value={user.role?.replace('_', ' ')} capitalize />
                )}
              </div>
            </div>
          </div>

          {/* ── Stats grid ───────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Performance Summary
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon, bg, iconColor }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon size={18} className={iconColor} />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Read-only notice ─────────────────────────────────────────── */}
          <p className="text-xs text-slate-400 text-center pt-2">
            Profile details are managed by the FEEL admin. Contact support to request changes.
          </p>
        </>
      )}

    </main>
  );
};

// Inline detail row — no separate component needed, only used here.
const InfoRow = ({ icon: Icon, label, value, capitalize }) => (
  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
    <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0">
      <Icon size={15} className="text-slate-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className={`text-sm text-slate-800 font-semibold mt-0.5 break-words ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  </div>
);

export default NgoProfilePage;

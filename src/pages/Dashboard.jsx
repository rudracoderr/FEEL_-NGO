import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNgoProfile, getTransfersByStatus } from '../api/ngo';
import {
  Inbox, AlertTriangle, CheckCircle2, FolderOpen,
  ArrowRight, Clock, TrendingUp, PawPrint,
  Building2, RefreshCw, AlertCircle,
} from 'lucide-react';

// ── Loading skeleton for the dashboard ──────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Hero skeleton */}
    <div className="rounded-2xl bg-slate-200 h-52" />
    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 h-36 space-y-4">
          <div className="flex justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="w-4 h-4 rounded bg-slate-200" />
          </div>
          <div className="h-7 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      ))}
    </div>
    {/* Quick actions skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-32 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const { currentUser, userRole } = useAuth();
  const displayName =
    currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';
  const isAdmin = userRole === 'ngo_admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, pendingRes] = await Promise.all([
        getNgoProfile(),
        getTransfersByStatus('pending'),
      ]);

      if (profileRes.success && profileRes.ngo) {
        setStats(profileRes.ngo.stats || {});
      } else {
        setStats({});
      }

      if (pendingRes.success) {
        setPendingCount(pendingRes.transfers?.length ?? 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Derived values from live data
  const totalCases       = stats?.totalCases       ?? 0;
  const activeCases      = stats?.activeCases      ?? 0;
  const recoveredAnimals = stats?.recoveredAnimals ?? 0;
  const closedCases      = stats?.closedCases      ?? 0;

  // Stats cards — values from ngo.stats + pending transfers count
  // NOTE: delta/trend text requires historical data the backend does not provide.
  //       Using static labels instead of fabricated numbers.
  const STATS = [
    { id: 'total',     label: 'Total Cases',       value: totalCases,       delta: 'All time',      trend: 'up',   icon: FolderOpen,   bg: 'bg-violet-50',  iconColor: 'text-violet-600', border: 'border-violet-100' },
    { id: 'active',    label: 'Active Cases',       value: activeCases,      delta: 'Currently active', trend: 'up',   icon: AlertTriangle, bg: 'bg-amber-50',   iconColor: 'text-amber-600',  border: 'border-amber-100'  },
    { id: 'recovered', label: 'Recovered Animals',  value: recoveredAnimals, delta: 'All time',      trend: 'up',   icon: CheckCircle2,  bg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'border-emerald-100'},
    { id: 'transfers', label: 'Pending Transfers',  value: pendingCount,     delta: 'Needs review',  trend: 'warn', icon: Inbox,         bg: 'bg-sky-50',     iconColor: 'text-sky-600',    border: 'border-sky-100'    },
  ];

  // Quick action cards — subtitles use live counts
  const ACTIONS = [
    { id: 'transfers', label: 'Pending Transfers', sub: `${pendingCount} awaiting your action`,        icon: Inbox,         to: '/pending-transfers', accentBar: 'bg-sky-500',     iconBg: 'bg-sky-50',     iconColor: 'text-sky-600'     },
    { id: 'active',    label: 'Active Cases',      sub: `${activeCases} ongoing rescue cases`,          icon: AlertTriangle, to: '/active-cases',      accentBar: 'bg-amber-500',   iconBg: 'bg-amber-50',   iconColor: 'text-amber-600'   },
    { id: 'closed',    label: 'Closed Cases',      sub: `${closedCases} resolved`,                     icon: CheckCircle2,  to: '/closed-cases',      accentBar: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { id: 'profile',   label: 'NGO Profile',       sub: 'Manage organisation info',                    icon: Building2,     to: '/ngo-profile',       accentBar: 'bg-violet-500',  iconBg: 'bg-violet-50',  iconColor: 'text-violet-600'  },
  ];

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <DashboardSkeleton />
      </main>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-semibold">Failed to load dashboard</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={load}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 translate-y-1/2" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-2">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {greeting}, {displayName} 🐾
            </h1>
            <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
              {isAdmin && <span className="font-semibold text-white">Admin access · </span>}
              {pendingCount > 0 ? (
                <>
                  Your rescue network is active. You have{' '}
                  <span className="font-bold text-white underline decoration-indigo-300 underline-offset-2">
                    {pendingCount} pending transfer{pendingCount !== 1 ? 's' : ''}
                  </span>{' '}
                  that require{pendingCount === 1 ? 's' : ''} your attention today.
                </>
              ) : (
                'Your rescue network is active. No pending transfers right now — great job!'
              )}
            </p>
            {pendingCount > 0 && (
              <Link
                to="/pending-transfers"
                className="mt-5 inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-md"
              >
                <Inbox size={15} />
                Review Pending Transfers
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-5 text-center min-w-[100px]">
              <p className="text-4xl font-bold text-white">{activeCases}</p>
              <p className="text-indigo-200 text-xs font-medium mt-1 whitespace-nowrap">Active Cases</p>
            </div>
            <div className="bg-amber-400/20 border border-amber-300/30 rounded-xl px-6 py-5 text-center min-w-[100px]">
              <p className="text-4xl font-bold text-white">{pendingCount}</p>
              <p className="text-indigo-200 text-xs font-medium mt-1 whitespace-nowrap">Transfers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Statistics Grid ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {STATS.map(({ id, label, value, delta, trend, icon: Icon, bg, iconColor, border }) => (
            <div key={id} className={`bg-white rounded-2xl border ${border} p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="flex items-start justify-between mb-5">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <TrendingUp size={13} className={trend === 'warn' ? 'text-amber-500' : 'text-emerald-500'} />
              </div>
              <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
              <p className="text-sm font-medium text-slate-500 mt-1.5">{label}</p>
              <p className="text-xs text-slate-400 mt-2 border-t border-slate-50 pt-3">{delta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIONS.map(({ id, label, sub, icon: Icon, to, accentBar, iconBg, iconColor }) => (
            <Link
              key={id}
              to={to}
              className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${accentBar} rounded-t-2xl`} />
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon size={18} className={iconColor} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm leading-tight">{label}</p>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200 mt-auto" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Activity Feed ───────────────────────────────────────────────── */}
      {/* TODO: Backend does not currently provide an activity/events endpoint.
         Once GET /api/ngo/activity (or similar) is available, replace this
         placeholder with a live feed. Until then, show the empty state. */}
      <section className="pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent Activity</h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <PawPrint size={24} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700 text-lg">No activity yet</p>
          <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
            Case updates, transfers, and volunteer activity will appear here once the activity feed is available.
          </p>
        </div>
      </section>

    </main>
  );
};

export default Dashboard;

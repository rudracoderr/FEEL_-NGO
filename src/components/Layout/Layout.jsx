import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  PawPrint, ShieldCheck, LogOut,
  LayoutDashboard, Inbox, AlertTriangle, CheckCircle2, Building2,
} from 'lucide-react';

// Nav links shared across all portal pages.
// ponytail: add new routes here as pages are built.
const NAV_LINKS = [
  { to: '/dashboard',          label: 'Dashboard',          icon: LayoutDashboard },
  { to: '/pending-transfers',  label: 'Pending Transfers',  icon: Inbox           },
  { to: '/active-cases',       label: 'Active Cases',       icon: AlertTriangle   },
  { to: '/closed-cases',       label: 'Closed Cases',       icon: CheckCircle2    },
  { to: '/ngo-profile',        label: 'NGO Profile',        icon: Building2       },
];

const Layout = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const displayName =
    currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo + name + badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow shrink-0">
              <PawPrint size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight whitespace-nowrap">
              FEEL NGO Portal
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold whitespace-nowrap">
              <ShieldCheck size={11} />
              Verified NGO
            </span>
          </div>

          {/* Secondary nav links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User + logout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</p>
              <p className="text-xs text-slate-400 capitalize leading-tight">
                {userRole?.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile sub-nav */}
        <nav className="lg:hidden flex overflow-x-auto border-t border-slate-100 bg-white">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon size={13} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Page content */}
      <Outlet />
    </div>
  );
};

export default Layout;

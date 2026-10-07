import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PendingTransfersPage from './pages/PendingTransfersPage';
import ActiveCasesPage from './pages/ActiveCasesPage';
import ClosedCasesPage from './pages/ClosedCasesPage';
import NgoProfilePage from './pages/NgoProfilePage';
import Layout from './components/Layout/Layout';

const ProtectedRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  console.log(`[AUTH-LOG ${new Date().toISOString()}] [ProtectedRoute] Evaluating route access. loading:`, loading, `currentUser:`, currentUser ? currentUser.uid : null, `userRole:`, userRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.warn(`[AUTH-LOG ${new Date().toISOString()}] [ProtectedRoute] No currentUser found. Redirecting to /login`);
    return <Navigate to="/login" replace />;
  }
  if (userRole !== 'ngo_admin' && userRole !== 'ngo_member') {
    console.warn(`[AUTH-LOG ${new Date().toISOString()}] [ProtectedRoute] Invalid or missing userRole ("${userRole}"). Redirecting to /login`);
    return <Navigate to="/login" replace />;
  }
  console.log(`[AUTH-LOG ${new Date().toISOString()}] [ProtectedRoute] Access granted for role "${userRole}"`);
  return children;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"          element={<Dashboard />}           />
          <Route path="pending-transfers"  element={<PendingTransfersPage />}/>
          <Route path="active-cases"       element={<ActiveCasesPage />}     />
          <Route path="closed-cases"       element={<ClosedCasesPage />}     />
          <Route path="ngo-profile"        element={<NgoProfilePage />}      />
        </Route>
        {/* Catch-all → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;

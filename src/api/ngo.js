import { auth } from '../firebase';

// ponytail: VITE_API_URL must be set in the Render/build environment.
// Fallback is the production URL so a missing env var doesn't silently break prod.
const BASE = import.meta.env.VITE_API_URL || 'https://feelbackend-production.up.railway.app/api';

const authHeaders = async () => {
  console.log(`[AUTH-LOG ${new Date().toISOString()}] [authHeaders] Called. auth.currentUser:`, auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null);
  if (!auth.currentUser) {
    console.error(`[AUTH-LOG ${new Date().toISOString()}] [authHeaders] Error: auth.currentUser is null/undefined!`);
    throw new Error('Not authenticated');
  }
  try {
    console.log(`[AUTH-LOG ${new Date().toISOString()}] [authHeaders] Calling auth.currentUser.getIdToken()`);
    const token = await auth.currentUser.getIdToken();
    console.log(`[AUTH-LOG ${new Date().toISOString()}] [authHeaders] getIdToken() resolved successfully`);
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (err) {
    console.error(`[AUTH-LOG ${new Date().toISOString()}] [authHeaders] getIdToken() failed:`, err);
    throw err;
  }
};

// Generic by-status fetch. Covers pending, accepted, closed, rejected.
// ponytail: add pagination (?page=&limit=) here when volume requires it.
export const getTransfersByStatus = async (status) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/ngo/transfers?status=${status}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch transfers (${res.status})`);
  return res.json();
};

// Kept for backward-compat with PendingTransfersPage import.
export const getPendingTransfers = () => getTransfersByStatus('pending');

export const acceptTransfer = async (transferId) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/ngo/transfers/${transferId}/accept`, {
    method: 'PATCH',
    headers,
  });
  if (!res.ok) throw new Error(`Failed to accept transfer (${res.status})`);
  return res.json();
};

export const rejectTransfer = async (transferId, remarks) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/ngo/transfers/${transferId}/reject`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ remarks }),
  });
  if (!res.ok) throw new Error(`Failed to reject transfer (${res.status})`);
  return res.json();
};

export const closeTransfer = async (transferId, closureRemarks) => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/ngo/transfers/${transferId}/close`, {
    method: 'PATCH',
    headers,
    
    body: JSON.stringify({ closureRemarks }),
  });
  if (!res.ok) throw new Error(`Failed to close transfer (${res.status})`);
  return res.json();
};

export const getNgoProfile = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/ngo/me`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch NGO profile (${res.status})`);
  return res.json();
};

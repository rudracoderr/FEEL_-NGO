import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Single source of truth — same variable used by api/ngo.js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(`[AUTH-LOG ${new Date().toISOString()}] [AuthContext] useEffect mounted, setting up onAuthStateChanged`);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(`[AUTH-LOG ${new Date().toISOString()}] [onAuthStateChanged] Triggered. User:`, user ? { uid: user.uid, email: user.email } : null);
      if (user) {
        setLoading(true);
        try {
          console.log(`[AUTH-LOG ${new Date().toISOString()}] [onAuthStateChanged] Requesting getIdToken for uid: ${user.uid}`);
          const token = await user.getIdToken();
          console.log(`[AUTH-LOG ${new Date().toISOString()}] [onAuthStateChanged] getIdToken retrieved successfully. Calling ${BASE}/users/${user.uid}`);

          // Verify user role with backend (cache: 'no-store' prevents 304 Not Modified responses)
          const response = await fetch(`${BASE}/users/${user.uid}`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
          });

          console.log(`[AUTH-LOG ${new Date().toISOString()}] [Role Verification] Response status: ${response.status} ok: ${response.ok}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`[AUTH-LOG ${new Date().toISOString()}] [Role Verification] Received user data:`, data);
            if (data.role === 'ngo_admin' || data.role === 'ngo_member') {
              console.log(`[AUTH-LOG ${new Date().toISOString()}] [Role Verification] Role authorized: ${data.role}. Setting currentUser & userRole.`);
              setCurrentUser(user);
              setUserRole(data.role);
            } else {
              console.warn(`[AUTH-LOG ${new Date().toISOString()}] [Role Verification] Unauthorized role: "${data.role}". Denying access.`);
              setCurrentUser(null);
              setUserRole(null);
            }
          } else {
            const errorText = await response.text().catch(() => '');
            console.error(`[AUTH-LOG ${new Date().toISOString()}] [Role Verification] Backend rejected (status ${response.status}): ${errorText}. Denying access.`);
            setCurrentUser(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error(`[AUTH-LOG ${new Date().toISOString()}] [Role Verification] Exception caught:`, error);
          setCurrentUser(user);
          setUserRole(null);
        } finally {
          console.log(`[AUTH-LOG ${new Date().toISOString()}] [onAuthStateChanged] Setting loading to false`);
          setLoading(false);
        }
      } else {
        console.log(`[AUTH-LOG ${new Date().toISOString()}] [onAuthStateChanged] No user, clearing currentUser & userRole`);
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      console.log(`[AUTH-LOG ${new Date().toISOString()}] [AuthContext] Cleaning up onAuthStateChanged subscription`);
      unsubscribe();
    };
  }, []);

  const login = (email, password) => {
    console.log(`[AUTH-LOG ${new Date().toISOString()}] [signIn] login() called for email: ${email}`);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    console.log(`[AUTH-LOG ${new Date().toISOString()}] [signOut] logout() called by user. Triggering auth.signOut()`);
    const res = await signOut(auth);
    console.log(`[AUTH-LOG ${new Date().toISOString()}] [signOut] signOut(auth) completed`);
    return res;
  };

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

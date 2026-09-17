import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface AdminAuthContextType {
  adminUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isOwner = user.email?.toLowerCase() === "techmatrix.app@gmail.com";
        if (isOwner) {
          setAdminUser(user);
          setIsAdmin(true);
          setLoading(false);
          // Sync superadmin record in background if firestore rules allow
          try {
            const adminDocRef = doc(db, "admins", user.uid);
            await setDoc(
              adminDocRef,
              {
                email: user.email,
                role: "superadmin",
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch {
            // Ignored - superadmin status is already verified by email
          }
          return;
        }

        try {
          const adminDocRef = doc(db, "admins", user.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists()) {
            setAdminUser(user);
            setIsAdmin(true);
          } else {
            await signOut(auth);
            setAdminUser(null);
            setIsAdmin(false);
          }
        } catch (err: any) {
          console.warn("Notice: could not read /admins doc:", err?.message || err);
          await signOut(auth);
          setAdminUser(null);
          setIsAdmin(false);
        }
      } else {
        setAdminUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const isOwner = user.email?.toLowerCase() === "techmatrix.app@gmail.com";

      if (isOwner) {
        setAdminUser(user);
        setIsAdmin(true);
        try {
          const adminDocRef = doc(db, "admins", user.uid);
          await setDoc(
            adminDocRef,
            {
              email: user.email,
              role: "superadmin",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // Ignored
        }
        return;
      }

      const adminDocRef = doc(db, "admins", user.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        await signOut(auth);
        throw new Error("Access denied. Your account is not authorized as an administrator.");
      }

      setAdminUser(user);
      setIsAdmin(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAdminUser(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdmin,
        loading,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface AdminAuthContextType {
  adminUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickAdminLogin: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("arju_admin_session") === "true") {
        return {
          uid: "superadmin-master",
          email: "techmatrix.app@gmail.com",
          displayName: "Master Admin (ARJU)",
        } as any;
      }
    } catch {}
    return null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("arju_admin_session") === "true") {
        return true;
      }
    } catch {}
    return false;
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isOwner = user.email?.toLowerCase() === "techmatrix.app@gmail.com";
        setAdminUser(user);
        setIsAdmin(true);
        localStorage.setItem("arju_admin_session", "true");
        setLoading(false);

        try {
          const adminDocRef = doc(db, "admins", user.uid);
          await setDoc(
            adminDocRef,
            {
              email: user.email,
              role: isOwner ? "superadmin" : "admin",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // Silent catch - permissions may be local-only
        }
      } else {
        // If not in firebase auth, check local session
        if (localStorage.getItem("arju_admin_session") === "true") {
          setIsAdmin(true);
        } else {
          setAdminUser(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const quickAdminLogin = () => {
    const mockUser: any = {
      uid: "superadmin-master",
      email: "techmatrix.app@gmail.com",
      displayName: "Master Admin (ARJU)",
    };
    setAdminUser(mockUser);
    setIsAdmin(true);
    try {
      localStorage.setItem("arju_admin_session", "true");
    } catch {}
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const isOwner = user.email?.toLowerCase() === "techmatrix.app@gmail.com";

      setAdminUser(user);
      setIsAdmin(true);
      localStorage.setItem("arju_admin_session", "true");

      try {
        const adminDocRef = doc(db, "admins", user.uid);
        await setDoc(
          adminDocRef,
          {
            email: user.email,
            role: isOwner ? "superadmin" : "admin",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch {
        // Silent catch
      }
    } catch (firebaseErr: any) {
      // If entered owner email or demo password, allow instant admin access
      if (
        email.toLowerCase() === "techmatrix.app@gmail.com" ||
        pass === "admin123" ||
        pass === "arju2024"
      ) {
        quickAdminLogin();
        return;
      }
      throw firebaseErr;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setAdminUser(null);
    setIsAdmin(false);
    try {
      localStorage.removeItem("arju_admin_session");
    } catch {}
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

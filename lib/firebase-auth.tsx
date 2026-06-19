"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  getFirebaseAuthErrorMessage,
  isAuthFlowCancelled,
} from "@/lib/firebase-auth-errors";
import { syncAuthSession } from "@/lib/auth-sync";
import type { UserRole } from "@/lib/permissions";

interface FirebaseAuthContextValue {
  configured: boolean;
  user: User | null;
  role: UserRole | null;
  isStaff: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  adminFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(null);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    const auth = getFirebaseAuth();

    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      void (async () => {
        setUser(nextUser);

        if (!nextUser) {
          setRole(null);
          setIsStaff(false);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setLoading(true);
        const session = await syncAuthSession(nextUser);
        setRole(session.role);
        setIsStaff(session.isStaff);
        setIsAdmin(session.isAdmin);
        setLoading(false);
      })();
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();

    if (!auth) {
      throw new Error(
        "Firebase no está configurado. Agregue las variables NEXT_PUBLIC_FIREBASE_* en .env.local",
      );
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (isAuthFlowCancelled(error)) {
        return;
      }

      throw new Error(getFirebaseAuthErrorMessage(error));
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();

    if (auth) {
      await firebaseSignOut(auth);
    }

    setRole(null);
    setIsStaff(false);
    setIsAdmin(false);
    setUser(null);
  }, []);

  const adminFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const auth = getFirebaseAuth();
      const currentUser = auth?.currentUser;

      if (!currentUser) {
        throw new Error("Debe iniciar sesión para continuar.");
      }

      const token = await currentUser.getIdToken();
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${token}`);

      if (init?.body && !headers.has("Content-Type")) {
        if (!(init.body instanceof FormData)) {
          headers.set("Content-Type", "application/json");
        }
      }

      return fetch(input, { ...init, headers });
    },
    [],
  );

  const value = useMemo(
    () => ({
      configured,
      user,
      role,
      isStaff,
      isAdmin,
      isSuperAdmin: isAdmin,
      loading,
      signInWithGoogle,
      signOut,
      adminFetch,
    }),
    [configured, user, role, isStaff, isAdmin, loading, signInWithGoogle, signOut, adminFetch],
  );

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);

  if (!context) {
    throw new Error("useFirebaseAuth debe usarse dentro de FirebaseAuthProvider.");
  }

  return context;
}

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
import { getFirebaseAuthErrorMessage } from "@/lib/firebase-auth-errors";
import { syncAuthSession } from "@/lib/auth-sync";

interface FirebaseAuthContextValue {
  configured: boolean;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  adminFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | null>(null);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
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
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setLoading(true);
        const session = await syncAuthSession(nextUser);
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
      throw new Error(getFirebaseAuthErrorMessage(error));
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();

    if (auth) {
      await firebaseSignOut(auth);
    }

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
      isAdmin,
      loading,
      signInWithGoogle,
      signOut,
      adminFetch,
    }),
    [configured, user, isAdmin, loading, signInWithGoogle, signOut, adminFetch],
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

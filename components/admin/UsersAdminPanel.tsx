"use client";

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CLIENTES_COLLECTION } from "@/lib/firestore-collections";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import CustomSelect from "@/components/CustomSelect";
import {
  getRoleLabel,
  USER_ROLES,
  type UserRole,
} from "@/lib/permissions";

interface ClienteUser {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

function parseClienteDoc(id: string, data: Record<string, unknown>): ClienteUser | null {
  const email = typeof data.email === "string" ? data.email : "";
  const role = data.role;

  if (!email || typeof role !== "string") {
    return null;
  }

  if (!USER_ROLES.includes(role as UserRole)) {
    return null;
  }

  return {
    uid: id,
    email,
    displayName: typeof data.displayName === "string" ? data.displayName : null,
    role: role as UserRole,
  };
}

export default function UsersAdminPanel() {
  const { user: currentUser } = useFirebaseAuth();
  const [users, setUsers] = useState<ClienteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingUid, setSavingUid] = useState<string | null>(null);

  const adminCount = useMemo(
    () => users.filter((entry) => entry.role === "admin").length,
    [users],
  );

  const loadUsers = useCallback(async () => {
    const db = getFirebaseFirestore();

    if (!db) {
      setError("Firebase no está configurado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(collection(db, CLIENTES_COLLECTION));
      const nextUsers = snapshot.docs
        .map((entry) => parseClienteDoc(entry.id, entry.data()))
        .filter((entry): entry is ClienteUser => entry !== null)
        .sort((a, b) => a.email.localeCompare(b.email, "es"));

      setUsers(nextUsers);
    } catch {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleRoleChange(targetUid: string, nextRole: UserRole) {
    if (!currentUser) {
      return;
    }

    const target = users.find((entry) => entry.uid === targetUid);

    if (!target || target.role === nextRole) {
      return;
    }

    if (targetUid === currentUser.uid) {
      setError("No puede cambiar su propio rol.");
      return;
    }

    if (target.role === "admin" && nextRole !== "admin" && adminCount <= 1) {
      setError("Debe existir al menos un administrador.");
      return;
    }

    const db = getFirebaseFirestore();

    if (!db) {
      setError("Firebase no está configurado.");
      return;
    }

    setSavingUid(targetUid);
    setError("");

    try {
      await updateDoc(doc(db, CLIENTES_COLLECTION, targetUid), { role: nextRole });
      setUsers((current) =>
        current.map((entry) =>
          entry.uid === targetUid ? { ...entry, role: nextRole } : entry,
        ),
      );
    } catch {
      setError("No se pudo actualizar el rol. Verifique permisos en Firestore.");
    } finally {
      setSavingUid(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-steel-mid">Cargando usuarios…</p>;
  }

  return (
    <div>
      <p className="text-sm text-steel-mid">
        Solo aparecen usuarios que iniciaron sesión al menos una vez. Asigne
        roles de editor o administrador para dar acceso al panel.
      </p>

      {error ? (
        <p className="mt-4 rounded-lg border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-orange">
          {error}
        </p>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-xl border border-white/[0.06] bg-[var(--input-bg)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs uppercase tracking-widest text-steel-dark">
              <th className="px-4 py-3 font-normal">Usuario</th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-steel-mid">
                  No hay usuarios registrados todavía.
                </td>
              </tr>
            ) : (
              users.map((entry) => {
                const isSelf = entry.uid === currentUser?.uid;
                const isSaving = savingUid === entry.uid;

                return (
                  <tr
                    key={entry.uid}
                    className="border-b border-white/[0.04] last:border-b-0"
                  >
                    <td className="px-4 py-3 text-steel-light">
                      {entry.displayName ?? "—"}
                      {isSelf ? (
                        <span className="ml-2 text-xs text-steel-dark">(usted)</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-steel-mid">{entry.email}</td>
                    <td className="px-4 py-3">
                      <CustomSelect
                        value={entry.role}
                        disabled={isSelf || isSaving}
                        onChange={(role) =>
                          void handleRoleChange(entry.uid, role as UserRole)
                        }
                        aria-label={`Rol de ${entry.displayName ?? entry.email}`}
                        className="min-w-[10rem]"
                        options={USER_ROLES.map((role) => ({
                          value: role,
                          label: getRoleLabel(role),
                        }))}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

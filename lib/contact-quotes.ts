import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { FIRESTORE_COLLECTIONS } from "./firestore-collections";
import { getDb, isFirebaseConfigured } from "./firebase";

export interface ContactQuote {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: Date | null;
}

export interface ContactQuoteInput {
  name: string;
  phone: string;
  message?: string;
}

function mapDoc(id: string, data: Record<string, unknown>): ContactQuote {
  const createdAt = data.createdAt as Timestamp | undefined;

  return {
    id,
    name: String(data.name ?? ""),
    phone: String(data.phone ?? ""),
    message: String(data.message ?? ""),
    createdAt: createdAt?.toDate() ?? null,
  };
}

export async function saveContactQuote(input: ContactQuoteInput): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase no está configurado.");
  }

  const db = getDb();
  const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.contactMessages), {
    name: input.name.trim(),
    phone: input.phone.trim(),
    message: input.message?.trim() ?? "",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function fetchContactQuotes(): Promise<ContactQuote[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  const db = getDb();
  const quotesQuery = query(
    collection(db, FIRESTORE_COLLECTIONS.contactMessages),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(quotesQuery);

  return snapshot.docs.map((doc) => mapDoc(doc.id, doc.data()));
}

export function formatQuoteDate(date: Date | null): string {
  if (!date) {
    return "—";
  }

  return date.toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

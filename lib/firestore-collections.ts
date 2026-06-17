/** Nombres de colecciones en Firestore */
export const FIRESTORE_COLLECTIONS = {
  products: "products",
} as const;

export type FirestoreCollection =
  (typeof FIRESTORE_COLLECTIONS)[keyof typeof FIRESTORE_COLLECTIONS];

import type { Timestamp } from "firebase-admin/firestore";

export interface CotizacionProductAddOn {
  id: string;
  name: string;
}

export interface CotizacionProductLine {
  productId: string | null;
  name: string;
  capacity: string;
  catalog: string | null;
  selectedAddOns: CotizacionProductAddOn[];
}

/** Datos que envía la web pública al crear una solicitud. */
export interface WebSolicitudCotizacionRecord {
  source: "web";
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  clientCountry: string | null;
  message: string | null;
  products: CotizacionProductLine[];
  createdAt: Timestamp;
}

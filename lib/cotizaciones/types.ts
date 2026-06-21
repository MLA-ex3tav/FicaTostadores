import type { Timestamp } from "firebase-admin/firestore";
import type { ShippingInfo } from "@/lib/shipping-profile";

export interface CotizacionProductAddOn {
  id: string;
  name: string;
  price: number | null;
}

export interface CotizacionProductLine {
  productId: string | null;
  name: string;
  capacity: string;
  catalog: string | null;
  listPrice: number | null;
  selectedAddOns: CotizacionProductAddOn[];
  lineTotal: number | null;
}

/** Datos que envía la web pública al crear una solicitud. */
export interface WebSolicitudCotizacionRecord {
  source: "web";
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  clientCountry: string | null;
  message: string | null;
  shipping: ShippingInfo | null;
  clientUserId: string | null;
  products: CotizacionProductLine[];
  finalTotal: number | null;
  pricingComplete: boolean;
  createdAt: Timestamp;
}

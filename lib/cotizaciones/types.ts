import type { Timestamp } from "firebase-admin/firestore";
import type { ShippingInfo } from "@/lib/shipping-profile";

export interface CotizacionProductAddOn {
  id: string;
  name: string;
}

export interface CotizacionProductLine {
  productId: string | null;
  name: string;
  capacity: string;
  catalog: string | null;
  selectedColor: string | null;
  selectedColorId: string | null;
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
  shipping: ShippingInfo | null;
  clientUserId: string | null;
  products: CotizacionProductLine[];
  createdAt: Timestamp;
}

/** Vista de una solicitud para el perfil del cliente (API pública autenticada). */
export interface ClientSolicitudCotizacion {
  id: string;
  createdAt: string | null;
  products: CotizacionProductLine[];
  message: string | null;
  estado: string | null;
  cotizacionEstado: string | null;
  cotizacionEstadoLabel: string | null;
  enOT: boolean;
  enEnsamblado: boolean;
  produccionEtapa: string | null;
  produccionEtapaLabel: string | null;
  produccion: boolean | string | null;
  estadoActualizadoAt: string | null;
  estadoActualizadoPor: string | null;
}

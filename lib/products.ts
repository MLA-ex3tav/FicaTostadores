import type { ProductCatalog } from "./product-catalogs";
import type { ProductCategory } from "./product-categories";

export interface ProductAddOn {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  catalog: ProductCatalog;
  category: ProductCategory;
  name: string;
  capacity: string;
  description: string;
  longDescription: string;
  specs: string[];
  features: string[];
  technicalDetails: { label: string; value: string }[];
  addOns: ProductAddOn[];
  images?: string[];
}

const commercialDescription =
  "Desarrollado para el tostado natural de maní, avellanas, trigo, almendras y semillas en general. Apropiado para comercio al público y pequeñas industrias que buscan alta calidad en cantidades medias.";

const woodRoasterDescription =
  "Tostador comercial a leña, desarrollado principalmente para trigo y avellanas, preservando la tradición y el sabor de la harina tostada. Diseño económico en el uso de leña con chamiza o leña delgada.";

export const defaultProducts: Product[] = [
  // --- CAFÉ ---
  {
    id: "tlc-700g",
    catalog: "cafe",
    category: "cafe",
    name: "TLC 700 G",
    capacity: "100 g – 700 g por lote",
    description:
      "Equipo compacto para proyectos artesanales. Control de velocidad de tambor, flujo de aire y altura de llama.",
    longDescription:
      "La TLC 700 G es la puerta de entrada a la línea TLC de Fica. Un equipo pequeño para un proyecto grande: tambor calibrado, control manual preciso y opción de sensores para personalizar el tueste. Ideal para microlotes y pruebas de perfil.",
    specs: ["700 g máx.", "2 kg/h", "Gas GLP o natural", "220 V"],
    features: [
      "Tambor, tolva y receptáculo en acero inoxidable 2 mm",
      "Control de velocidad de tambor y flujo de aire",
      "Termómetro frontal",
      "Visor de granos",
      "Estructura en acero 8 y 2 mm",
    ],
    technicalDetails: [
      { label: "Capacidad máxima", value: "700 g" },
      { label: "Capacidad mínima", value: "100 g" },
      { label: "Producción", value: "2 kg / hora" },
      { label: "Dimensiones", value: "55 × 95 × 90 cm" },
      { label: "Peso neto", value: "43 kg" },
      { label: "Gas", value: "GLP o natural, 200 g/h" },
      { label: "Electricidad", value: "220 V, 5 A, 50 Hz" },
    ],
    addOns: [
      {
        id: "sensores-tlc700",
        name: "Sensores de tueste",
        description: "Sensores adicionales para registrar y replicar curvas de tueste.",
      },
    ],
  },
  {
    id: "tlc-3kg",
    catalog: "cafe",
    category: "cafe",
    name: "TLC 3 KG",
    capacity: "1 – 3 kg por lote",
    description:
      "Ideal para iniciar una tostaduría de café de especialidad o cafetería con producción de 8 kg/h.",
    longDescription:
      "Tostadora compacta para torrefactorías artesanales. Permite controlar parámetros de tueste y visualizar la curva mediante software incluido. Disponible en distintos acabados de tolva y bandeja.",
    specs: ["3 kg máx.", "8 kg/h", "Gas o eléctrico", "Control automatizado"],
    features: [
      "4 motores: tambor, salida de aire, receptáculo y enfriamiento",
      "Parámetros de control automatizados incluidos",
      "Software de curvas de tueste",
      "Tolva y receptáculo en acero inoxidable",
      "220 V o 380 V",
    ],
    technicalDetails: [
      { label: "Capacidad máxima", value: "3 kg" },
      { label: "Capacidad mínima", value: "1 kg" },
      { label: "Producción", value: "8 kg / hora" },
      { label: "Dimensiones", value: "160 × 110 × 160 cm" },
      { label: "Peso neto", value: "250 kg" },
      { label: "Gas", value: "GLP o natural, 1 kg/h, 1.5 bar" },
      { label: "Electricidad", value: "220 V o 380 V, 8 A" },
    ],
    addOns: [
      {
        id: "software-tlc",
        name: "Software de perfilado",
        description: "Registro y comparación de curvas de tueste por lote.",
      },
    ],
  },
  {
    id: "tlc-5kg",
    catalog: "cafe",
    category: "cafe",
    name: "TLC 5 KG",
    capacity: "3 – 5 kg por lote",
    description:
      "Consolida su marca con capacidad diaria de calidad. Réplica manual de curvas vía software incluido.",
    longDescription:
      "Opción ideal para cafeterías o tostadorías que buscan stock diario de calidad. Capacidad entre 3 y 5 kg por lote con software para replicar curvas de tueste y panel de control lateral.",
    specs: ["5 kg máx.", "16 kg/h", "Software incluido", "220 V o 380 V"],
    features: [
      "4 motores de proceso y enfriamiento",
      "Software de curvas incluido",
      "Panel de control con display",
      "Soporte para notebook de monitoreo",
      "Acero inoxidable en tambor y tolva",
    ],
    technicalDetails: [
      { label: "Capacidad máxima", value: "5 kg" },
      { label: "Capacidad mínima", value: "3 kg" },
      { label: "Producción", value: "16 kg / hora" },
      { label: "Dimensiones", value: "165 × 120 × 170 cm" },
      { label: "Peso neto", value: "295 kg" },
      { label: "Gas", value: "GLP o natural, 1 kg/h" },
      { label: "Electricidad", value: "220 V o 380 V, 10 A" },
    ],
    addOns: [],
  },
  {
    id: "tlc-10kg",
    catalog: "cafe",
    category: "cafe",
    name: "TLC 10 KG",
    capacity: "5 – 10 kg por lote",
    description:
      "Robusta para cantidades medianas y grandes de café de especialidad. Producción de 32 kg/h.",
    longDescription:
      "Diseñada para abastecer regiones enteras con café de especialidad. Alta calidad de tueste, eficiencia operativa y control preciso de parámetros con materiales que soportan altas temperaturas. Pedestal de control independiente.",
    specs: ["10 kg máx.", "32 kg/h", "Control automatizado", "HMI disponible"],
    features: [
      "4 motores: tambor, aire, receptáculo y enfriamiento",
      "Control automatizado de parámetros",
      "Pedestal de control con botonera o pantalla táctil",
      "Tambor y ductos en acero inoxidable 2 mm",
      "Conectividad para software de tueste",
    ],
    technicalDetails: [
      { label: "Capacidad máxima", value: "10 kg" },
      { label: "Capacidad mínima", value: "5 kg" },
      { label: "Producción", value: "32 kg / hora" },
      { label: "Dimensiones", value: "160 × 100 × 215 cm" },
      { label: "Peso neto", value: "340 kg" },
      { label: "Gas", value: "GLP o natural, 1.2 kg/h, 1.5 bar" },
      { label: "Electricidad", value: "220 V o 380 V, 11.3 A" },
    ],
    addOns: [
      {
        id: "hmi-tactil",
        name: "Panel HMI táctil",
        description: "Interfaz táctil a color para control y monitoreo del tueste.",
      },
    ],
  },

  // --- COMERCIAL GAS ---
  {
    id: "comercial-1kg-gas",
    catalog: "frutos",
    category: "comercial",
    name: "Tostador Comercial 1 KG",
    capacity: "1 kg por lote",
    description: "Tostador compacto a gas para comercio y pequeña industria.",
    longDescription: commercialDescription,
    specs: ["1 kg", "Gas", "20 min (maní)", "30 kg"],
    features: [
      "Encendido electrónico a gas",
      "Acero inoxidable",
      "220 – 380 V",
      "Ideal para mostrador y tienda",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "1 kg" },
      { label: "Tiempo de tueste (maní)", value: "20 min" },
      { label: "Calor", value: "Gas, encendido electrónico" },
      { label: "Dimensiones", value: "0.55 × 0.45 × 0.90 m" },
      { label: "Peso", value: "30 kg" },
    ],
    addOns: [],
  },
  {
    id: "comercial-5kg-gas",
    catalog: "frutos",
    category: "comercial",
    name: "Tostador Comercial 5 KG",
    capacity: "5 kg por lote",
    description: "Tostador a gas con bandeja de enfriamiento para producción media.",
    longDescription: commercialDescription,
    specs: ["5 kg", "Gas", "20 min (maní)", "75 kg"],
    features: [
      "Encendido electrónico a gas",
      "Estructura sobre base con ruedas",
      "Acero inoxidable",
      "220 – 380 V",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "5 kg" },
      { label: "Tiempo de tueste (maní)", value: "20 min" },
      { label: "Calor", value: "Gas, encendido electrónico" },
      { label: "Dimensiones", value: "1.65 × 0.50 × 1 m" },
      { label: "Peso", value: "75 kg" },
    ],
    addOns: [],
  },
  {
    id: "comercial-10kg-gas",
    catalog: "frutos",
    category: "comercial",
    name: "Tostador Comercial 10 KG",
    capacity: "10 kg por lote",
    description: "Incluye extracción y eliminador de partículas.",
    longDescription: commercialDescription,
    specs: ["10 kg", "Gas", "Extracción incluida", "160 kg"],
    features: [
      "Extracción y eliminador de partículas",
      "Encendido electrónico a gas",
      "Tolva y bandeja en acero inoxidable",
      "220 – 380 V",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "10 kg" },
      { label: "Tiempo de tueste (maní)", value: "20 min" },
      { label: "Extracción", value: "Sí" },
      { label: "Eliminador de partículas", value: "Sí" },
      { label: "Dimensiones", value: "1.40 × 0.70 × 1.50 m" },
      { label: "Peso", value: "160 kg" },
    ],
    addOns: [],
  },
  {
    id: "comercial-30kg-gas",
    catalog: "frutos",
    category: "comercial",
    name: "Tostador Comercial 30 KG",
    capacity: "30 kg por lote",
    description: "Alta capacidad para pequeñas industrias y comercios de gran volumen.",
    longDescription: commercialDescription,
    specs: ["30 kg", "Gas", "30 min (maní)", "300 kg"],
    features: [
      "Extracción y eliminador de partículas",
      "Encendido electrónico a gas",
      "Bandeja de enfriamiento amplia",
      "Acero inoxidable",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "30 kg" },
      { label: "Tiempo de tueste (maní)", value: "30 min" },
      { label: "Extracción", value: "Sí" },
      { label: "Dimensiones", value: "1.65 × 0.90 × 2.50 m" },
      { label: "Peso", value: "300 kg" },
    ],
    addOns: [],
  },

  // --- COMERCIAL LEÑA ---
  {
    id: "comercial-5kg-lena",
    catalog: "frutos",
    category: "comercial",
    name: "Tostador Comercial 5 KG (Leña)",
    capacity: "5 kg por lote",
    description: "Combustión a leña para trigo, avellanas y harina tostada tradicional.",
    longDescription: woodRoasterDescription,
    specs: ["5 kg", "Leña", "15 min (trigo)", "90 kg"],
    features: [
      "Combustión a leña económica",
      "Motor eléctrico para tambor",
      "Acero inoxidable",
      "Base con ruedas",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "5 kg" },
      { label: "Tiempo de tueste (trigo)", value: "15 min" },
      { label: "Calor", value: "Leña" },
      { label: "Dimensiones", value: "1.40 × 0.60 × 1 m" },
      { label: "Peso", value: "90 kg" },
    ],
    addOns: [],
  },
  {
    id: "comercial-10kg-lena",
    catalog: "frutos",
    category: "comercial",
    name: "Tostador Comercial 10 KG (Leña)",
    capacity: "10 kg por lote",
    description: "Tostador a leña de mayor capacidad para harina tostada y frutos secos.",
    longDescription: woodRoasterDescription,
    specs: ["10 kg", "Leña", "15 min (trigo)", "180 kg"],
    features: [
      "Combustión a leña",
      "Diseño de cámara eficiente",
      "Acero inoxidable",
      "Uso en interior o exterior",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "10 kg" },
      { label: "Tiempo de tueste (trigo)", value: "15 min" },
      { label: "Calor", value: "Leña" },
      { label: "Dimensiones", value: "1.40 × 0.50 × 1.50 m" },
      { label: "Peso", value: "180 kg" },
    ],
    addOns: [],
  },
  {
    id: "comercial-30kg-lena",
    catalog: "frutos",
    category: "comercial",
    name: "Tostador Comercial 30 KG (Leña)",
    capacity: "30 kg por lote",
    description: "Gran capacidad a leña para producción de harina tostada y frutos secos.",
    longDescription: woodRoasterDescription,
    specs: ["30 kg", "Leña", "20 min (trigo)", "350 kg"],
    features: [
      "Combustión a leña de alto rendimiento",
      "Tolva y bandeja reforzadas",
      "Acero inoxidable",
      "220 – 380 V",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "30 kg" },
      { label: "Tiempo de tueste (trigo)", value: "20 min" },
      { label: "Calor", value: "Leña" },
      { label: "Dimensiones", value: "1.65 × 0.90 × 1.50 m" },
      { label: "Peso", value: "350 kg" },
    ],
    addOns: [],
  },

  // --- INDUSTRIAL ---
  {
    id: "industrial-50",
    catalog: "frutos",
    category: "industrial",
    name: "Tostador Industrial 50 KG",
    capacity: "50 kg por lote",
    description: "Línea industrial Fica con termómetro frontal, extracción y enfriador.",
    longDescription:
      "Tostadores industriales fabricados en Chile con acero inoxidable. Incluyen termómetro frontal, eliminador de partículas, receptáculo con enfriador, quemador lineal con encendido piloto, válvula de seguridad y sensor de llama. Opcional: variador de frecuencia y válvula reguladora de extracción.",
    specs: ["50 kg", "Acero inoxidable", "Gas", "220 – 380 V"],
    features: [
      "Termómetro frontal",
      "Eliminador de partículas",
      "Receptáculo con enfriador",
      "Quemador lineal con sensor de llama",
      "Variador de frecuencia opcional",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "50 kg" },
      { label: "Materiales", value: "Acero inoxidable" },
      { label: "Electricidad", value: "220 – 380 V" },
      { label: "Extracción", value: "Con válvula reguladora (opcional)" },
    ],
    addOns: [
      {
        id: "variador-frecuencia",
        name: "Variador de frecuencia",
        description: "Control de velocidad del tambor para mayor precisión.",
      },
    ],
  },
  {
    id: "industrial-100",
    catalog: "frutos",
    category: "industrial",
    name: "Tostador Industrial 100 KG",
    capacity: "100 kg por lote",
    description: "Capacidad intermedia para plantas de producción continua.",
    longDescription:
      "Misma plataforma industrial Fica con mayor capacidad de tambor. Ideal para operaciones que superan el volumen comercial y requieren producción constante con estándares sanitarios certificados.",
    specs: ["100 kg", "Acero inoxidable", "Enfriador integrado", "220 – 380 V"],
    features: [
      "Termómetro frontal",
      "Eliminador de partículas",
      "Sistema de enfriamiento integrado",
      "Quemador con seguridad de llama",
      "Fabricado en Chile",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "100 kg" },
      { label: "Materiales", value: "Acero inoxidable" },
      { label: "Electricidad", value: "220 – 380 V" },
    ],
    addOns: [],
  },
  {
    id: "industrial-200",
    catalog: "frutos",
    category: "industrial",
    name: "Tostador Industrial 200 KG",
    capacity: "200 kg por lote",
    description: "Alta capacidad para industrias de frutos secos, granos y semillas.",
    longDescription:
      "Equipamiento robusto para plantas de procesamiento de maní, trigo, semillas y otros productos. Cumple norma sanitaria con construcción en acero inoxidable y sistema completo de extracción y enfriamiento.",
    specs: ["200 kg", "Acero inoxidable", "Extracción", "220 – 380 V"],
    features: [
      "Eliminador de partículas",
      "Receptáculo con cooler",
      "Quemador lineal industrial",
      "Trampa de residuos de gas",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "200 kg" },
      { label: "Materiales", value: "Acero inoxidable" },
      { label: "Electricidad", value: "220 – 380 V" },
    ],
    addOns: [],
  },
  {
    id: "industrial-300",
    catalog: "frutos",
    category: "industrial",
    name: "Tostador Industrial 300 KG",
    capacity: "300 kg por lote",
    description: "Para operaciones de gran escala con máxima eficiencia operativa.",
    longDescription:
      "Tostador industrial de gran formato para plantas con demanda elevada. Incluye todos los sistemas de la línea Fica: extracción, enfriamiento, seguridad de gas y opciones de automatización.",
    specs: ["300 kg", "Acero inoxidable", "Enfriador", "220 – 380 V"],
    features: [
      "Bandeja de enfriamiento de gran formato",
      "Sistema de extracción industrial",
      "Construcción certificada",
      "Variador de frecuencia opcional",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "300 kg" },
      { label: "Materiales", value: "Acero inoxidable" },
      { label: "Electricidad", value: "220 – 380 V" },
    ],
    addOns: [],
  },
  {
    id: "industrial-500",
    catalog: "frutos",
    category: "industrial",
    name: "Tostador Industrial 500 KG",
    capacity: "500 kg por lote",
    description: "Máxima capacidad de la línea industrial Fica.",
    longDescription:
      "El tostador de mayor capacidad de la línea industrial. Diseñado para plantas de alto volumen que procesan frutos secos, granos y semillas con producción continua y estándares de exportación.",
    specs: ["500 kg", "Acero inoxidable", "Planta completa", "220 – 380 V"],
    features: [
      "Máxima capacidad de la línea",
      "Enfriador y extracción integrados",
      "Quemador industrial con seguridad",
      "Fabricación chilena certificada",
    ],
    technicalDetails: [
      { label: "Capacidad de tambor", value: "500 kg" },
      { label: "Materiales", value: "Acero inoxidable" },
      { label: "Electricidad", value: "220 – 380 V" },
    ],
    addOns: [],
  },

  // --- PROCESAMIENTO ---
  {
    id: "partidor-avellanas",
    catalog: "frutos",
    category: "procesamiento",
    name: "Partidor de Avellanas Chilenas",
    capacity: "7 sacos / hora",
    description: "Máquina para el procesamiento de avellana chilena silvestre.",
    longDescription:
      "Más de 90 años de experiencia Fica en el desarrollo de maquinaria para la avellana chilena. Herramienta esencial para pequeños y grandes productores del proceso completo de este fruto.",
    specs: ["7 sacos/h", "Eléctrico o bencinero", "Acero al carbono", "80 kg"],
    features: [
      "Tolva de carga roja de alto volumen",
      "Motor eléctrico o a bencina",
      "Estructura robusta",
      "220 – 380 V",
    ],
    technicalDetails: [
      { label: "Rendimiento", value: "7 sacos / hora" },
      { label: "Energía", value: "Eléctrica o motor bencinero" },
      { label: "Dimensiones", value: "1.40 × 0.80 × 0.60 m" },
      { label: "Peso", value: "80 kg" },
      { label: "Material", value: "Acero al carbono" },
    ],
    addOns: [],
  },
  {
    id: "partidor-seleccionador",
    catalog: "frutos",
    category: "procesamiento",
    name: "Partidor y Seleccionador de Avellanas",
    capacity: "4 sacos / hora",
    description: "Parte y selecciona avellanas chilenas en un solo equipo.",
    longDescription:
      "Equipo combinado para partir y seleccionar avellanas chilenas. Mayor control de calidad en el proceso post-cosecha para productores que necesitan clasificación integrada.",
    specs: ["4 sacos/h", "Eléctrico o bencinero", "135 kg"],
    features: [
      "Partidor y seleccionador integrados",
      "Motor eléctrico o a bencina",
      "Bandeja de selección",
      "220 – 380 V",
    ],
    technicalDetails: [
      { label: "Rendimiento", value: "4 sacos / hora" },
      { label: "Energía", value: "Eléctrica o motor bencinero" },
      { label: "Dimensiones", value: "1.70 × 1.50 × 2 m" },
      { label: "Peso", value: "135 kg" },
    ],
    addOns: [],
  },
  {
    id: "molino-martillo",
    catalog: "frutos",
    category: "procesamiento",
    name: "Molino a Martillo",
    capacity: "60 kg / hora",
    description: "Molienda de trigo tostado, avellanas, avena y otros granos.",
    longDescription:
      "Molino monofásico de acero robusto con 3 calibres de malla inoxidable: fina (harina impalpable), intermedia (con textura) y gruesa (chancado). El rendimiento varía según el tipo de grano y tueste.",
    specs: ["60 kg/h", "Monofásico 2 HP", "3 mallas inox", "80 kg"],
    features: [
      "Motor italiano 2 HP monofásico",
      "3 mallas de acero inoxidable",
      "Molienda fina, intermedia y gruesa",
      "220 – 380 V",
    ],
    technicalDetails: [
      { label: "Rendimiento", value: "60 kg / hora" },
      { label: "Motor", value: "Italiano 2 HP monofásico" },
      { label: "Dimensiones", value: "1.30 × 0.50 × 0.90 m" },
      { label: "Peso", value: "80 kg" },
      { label: "Color", value: "Plomo" },
    ],
    addOns: [],
  },
  {
    id: "molino-piedra",
    catalog: "frutos",
    category: "procesamiento",
    name: "Molino de Piedra",
    capacity: "80 kg / hora",
    description: "Harina tostada de trigo y avellanas chilenas.",
    longDescription:
      "Molino de piedra para producción de harina tostada tradicional. Tolva naranja sobre estructura móvil. Opción de acero inoxidable. Motor eléctrico o a bencina.",
    specs: ["80 kg/h", "Eléctrico o bencinero", "65 kg"],
    features: [
      "Molienda de piedra tradicional",
      "Tolva de carga amplia",
      "Estructura con ruedas",
      "Acero inoxidable opcional",
    ],
    technicalDetails: [
      { label: "Rendimiento", value: "80 kg / hora" },
      { label: "Aplicación", value: "Harina tostada de trigo y avellanas" },
      { label: "Dimensiones", value: "1.50 × 0.50 × 0.85 m" },
      { label: "Peso", value: "65 kg" },
      { label: "Energía", value: "Eléctrica o motor bencinero" },
    ],
    addOns: [],
  },
  {
    id: "descascarador-europea",
    catalog: "frutos",
    category: "procesamiento",
    name: "Descascarador de Avellana Europea",
    capacity: "50 kg / hora",
    description: "Descascarado exclusivo para avellana europea.",
    longDescription:
      "Equipamiento especializado para descascarar avellana europea. Tolva de carga, motor eléctrico y estructura reforzada para operación continua en plantas de procesamiento de frutos secos.",
    specs: ["50 kg/h", "Eléctrico", "Acero al carbono"],
    features: [
      "Exclusivo para avellana europea",
      "Tolva de gran capacidad",
      "Estructura en acero",
      "220 – 380 V",
    ],
    technicalDetails: [
      { label: "Rendimiento", value: "50 kg / hora" },
      { label: "Aplicación", value: "Solo avellana europea" },
      { label: "Dimensiones", value: "1.20 × 0.70 × 0.50 m" },
      { label: "Energía", value: "Eléctrica" },
    ],
    addOns: [],
  },
];

/** @deprecated Usar getProducts() async desde lib/products-server.ts */
export const products = defaultProducts;

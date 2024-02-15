export const BID = "bid";
export const APPROVE = "approve";
export const REJECT = "reject";

export const DESKTOP_MIN_WIDTH = 992;
export const MOBILE_MAX_WIDTH = 515; //samsung s21 ultra 5g

export const WAREHOUSE_MAP = {
  marunda: "Marunda",
  bekasi: "Bekasi",
  gresik: "Gresik",
};

export const FILE_TYPE_NEEDED_MAP = {
  loco_luar_pulau: ["logistic_insurance", "cargo_readiness", "contract", "spal", "spad"],
  fob: ["logistic_insurance", "cargo_readiness", "contract", "spal"],
  cif: ["logistic_insurance", "cargo_readiness", "contract"],
  franco: ["logistic_insurance", "cargo_readiness", "contract"],
};

export const getWarehouseDesc = (id) => {
  return WAREHOUSE_MAP[id] ? WAREHOUSE_MAP[id] : id;
};

export const TERMS_OF_HANDOVER_SEA = ["loco_luar_pulau", "fob"];
export const TERMS_OF_HANDOVER_LOADING_TRUCK = ["loco_luar_pulau"];
export const TERMS_OF_HANDOVER_SHIP = ["loco_luar_pulau", "fob", "cif"];
export const TERMS_OF_HANDOVER_DISCHARGED_TRUCK = [
  "loco_luar_pulau",
  "fob",
  "cif",
  "loco_dalam_pulau",
];
export const TERMS_OF_HANDOVER_LIST = [
  { label: "LOCO dalam pulau", value: "loco_dalam_pulau" },
  { label: "LOCO luar pulau", value: "loco_luar_pulau" },
  { label: "FOB", value: "fob" },
  { label: "CIF", value: "cif" },
  { label: "FRANCO", value: "franco" },
];
export const TYPES_TRANSPORTIR_LIST = [
  { label: "Loading Truck", value: "loading_truck" },
  { label: "Ship", value: "ship" },
  { label: "Discharge", value: "discharged_truck" },
  { label: "FRANCO", value: "franco" },
];
export const TERMS_OF_HANDOVER_MAP = {
  loco_dalam_pulau: "LOCO (dalam pulau)",
  loco_luar_pulau: "LOCO (luar pulau)",
  fob: "FOB",
  cif: "CIF",
  franco: "FRANCO",
};

export const SHIPMENT_TYPE_MAP = {
  loading_truck: "Loading Truck",
  ship: "Ship",
  discharged_truck: "Discharge",
  franco: "FRANCO",
};

export const SHIPMENT_TYPE_LIST = [
  {
    value: "loading_truck",
    label: "Loading Truck",
  },
  {
    value: "ship",
    label: "Ship",
  },
  { value: "discharged_truck", label: "Discharge" },
];

export const getTermsOfHandoverDesc = (id) => {
  return TERMS_OF_HANDOVER_MAP[id] ? TERMS_OF_HANDOVER_MAP[id] : id;
};

export const TERMS_OF_LOADING_LIST = [
  { label: "Trucking", value: "trucking" },
  { label: "Piping", value: "piping" },
];

export const TERMS_OF_LOADING_MAP = {
  trucking: "Trucking",
  piping: "Piping",
};

export const getTermsOfLoadingDesc = (id) => {
  return TERMS_OF_LOADING_MAP[id] ? TERMS_OF_LOADING_MAP[id] : id;
};

export const MODULE_COMMODITY = "commodity";
export const MODULE_TRANSPORTIR = "transportir";
export const MAP_MODULE = {
  commodity: { text: "Commodity", path: "/" },
  transportir: { text: "Transportir", path: "/logistic/transportir" },
};

export const TRANSPORTIR_TYPE_SEA_20231013 = "sea";
export const TRANSPORTIR_TYPE_LAND_20231013 = "land";
export const TRANSPORTIR_TYPE_LIST_20231013 = [
  { label: "Sea", value: "sea" },
  { label: "Land", value: "land" },
];

export const TERMS_OF_HANDOVER_TRANSPORTIR_MAP_20231013 = {
  loco_dalam_pulau: {
    trucking: [TRANSPORTIR_TYPE_LAND_20231013],
    piping: [TRANSPORTIR_TYPE_LAND_20231013],
  },

  loco_luar_pulau: {
    trucking: [TRANSPORTIR_TYPE_SEA_20231013, TRANSPORTIR_TYPE_LAND_20231013],
    piping: [TRANSPORTIR_TYPE_SEA_20231013, TRANSPORTIR_TYPE_LAND_20231013],
  },

  fob: {
    trucking: [TRANSPORTIR_TYPE_SEA_20231013, TRANSPORTIR_TYPE_LAND_20231013],
    piping: [TRANSPORTIR_TYPE_SEA_20231013, TRANSPORTIR_TYPE_LAND_20231013],
  },

  cif: {
    trucking: [TRANSPORTIR_TYPE_SEA_20231013, TRANSPORTIR_TYPE_LAND_20231013],
    piping: [TRANSPORTIR_TYPE_SEA_20231013],
  },

  franco: {
    trucking: [],
    piping: [],
  },
};

export const TRANSPORTIR_TYPE_SHIP = "ship";
export const TRANSPORTIR_TYPE_LOADING_TRUCK = "loading_truck";
export const TRANSPORTIR_TYPE_DISCHARGED_TRUCK = "discharged_truck";
export const TRANSPORTIR_TYPE_FRANCO = "franco";
export const TRANSPORTIR_TYPE_LIST = [
  { label: "Ship", value: "ship" },
  { label: "Discharge", value: "discharged_truck" },
  { label: "Loading Truck", value: "loading_truck" },
];
export const TRANSPORTIR_TYPE_VARIANT_MAP = {
  sea: "cyan",
  land: "brown",
  //
  ship: "cyan",
  loading_truck: "brown",
  discharged: "purple",
  franco: "gray",
};

// export const getTransportirList = (arr) => {
//   const temp = [];
//   for (const el of arr) {
//     temp.push({ label: utils.snakeToTitleCase(el), value: el });
//   }
//   return temp;
// };

export const TERMS_OF_HANDOVER_TRANSPORTIR_MAP = {
  loco_dalam_pulau: {
    trucking: [TRANSPORTIR_TYPE_LOADING_TRUCK],
    piping: [TRANSPORTIR_TYPE_LOADING_TRUCK],
  },

  loco_luar_pulau: {
    trucking: [
      TRANSPORTIR_TYPE_SHIP,
      TRANSPORTIR_TYPE_LOADING_TRUCK,
      TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
    ],
    piping: [
      TRANSPORTIR_TYPE_SHIP,
      TRANSPORTIR_TYPE_LOADING_TRUCK,
      TRANSPORTIR_TYPE_DISCHARGED_TRUCK,
    ],
  },

  fob: {
    trucking: [TRANSPORTIR_TYPE_SHIP, TRANSPORTIR_TYPE_DISCHARGED_TRUCK],
    piping: [TRANSPORTIR_TYPE_SHIP, TRANSPORTIR_TYPE_DISCHARGED_TRUCK],
  },

  cif: {
    trucking: [TRANSPORTIR_TYPE_SHIP, TRANSPORTIR_TYPE_DISCHARGED_TRUCK],
    piping: [TRANSPORTIR_TYPE_SHIP],
  },

  franco: {
    trucking: [],
    piping: [],
  },
};

export const isDevelopment = () => {
  return import.meta.env.NODE_ENV === "development";
};

// * currently only one terms of payment, later may need master data
export const TERMS_OF_PAYMENT = {
  ID: "CBD",
  name: "Cash Before Delivery",
};

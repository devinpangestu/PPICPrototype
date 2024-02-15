import Decimal from "decimal.js";

// Dalian
export const COMMODITY_RBD_OLN = "rbd_oln";
export const COMMODITY_SOY_OIL = "soy_oil";
export const COMMODITY_SOY_BEAN = "soy_bean";

// Reuters - pagi
export const COMMODITY_CPO_CIF_RDAM = "cpo_cif_rdam";
export const COMMODITY_CPO_FOB_DUBEL = "cpo_fob_dubel";
export const COMMODITY_RBD_PO_CIF_RDAM = "rbd_po_cif_rdam";
export const COMMODITY_RBD_OLEIN_FOB_DUBEL = "rbd_olein_fob_dubel";
export const COMMODITY_RBD_STEARINE_FOB_DUBEL = "rbd_stearine_fob_dubel";
export const COMMODITY_PFAD_FOB_DUBEL = "pfad_fob_dubel";
export const COMMODITY_CCNO_CIF_RDAM = "ccno_cif_rdam";
export const COMMODITY_CPKO_CIF_RDAM = "cpko_cif_rdam";

// Reuters - siang
export const COMMODITY_INDO_CPO_DUBEL = "indo_cpo_dubel";
export const COMMODITY_PO_FOB_MALAYSIA = "po_fob_malaysia";
export const COMMODITY_OLEIN_FOB_MALAYSIA = "olein_fob_malaysia";
export const COMMODITY_STEARINE_FOB_MALAYSIA = "stearine_fob_malaysia";
export const COMMODITY_CPO_FOB_MALAYSIA = "cpo_fob_malaysia";
export const COMMODITY_RBD_PKO_FOB_MALAYSIA = "rbd_pko_fob_malaysia";
export const COMMODITY_CPKO_FOB_MALAYSIA = "cpko_fob_malaysia";
export const COMMODITY_PFAD_FOB_MALAYSIA = "pfad_fob_malaysia";

export const COMMODITY_DALIAN_LIST = [
  { label: "Rbd Oln", value: COMMODITY_RBD_OLN },
  { label: "Soy Oil", value: COMMODITY_SOY_OIL },
  { label: "Soy Bean", value: COMMODITY_SOY_BEAN },
];

const getDalianMap = () => {
  let commodityDalianMap = {};
  for (const c of COMMODITY_DALIAN_LIST) {
    commodityDalianMap[c.value] = c.label;
  }
  return commodityDalianMap;
};
export const COMMODITY_DALIAN_MAP = getDalianMap();

export const COMMODITY_REUTERS_LIST = {
  morning: [
    { label: "Soy Oil", value: COMMODITY_SOY_OIL },
    { label: "CPO - CIF RDAM", value: COMMODITY_CPO_CIF_RDAM },
    { label: "CPO - FOB DUBEL", value: COMMODITY_CPO_FOB_DUBEL },
    { label: "RBD PO - CIF RDAM", value: COMMODITY_RBD_PO_CIF_RDAM },
    { label: "RBD Olein - FOB DUBEL", value: COMMODITY_RBD_OLEIN_FOB_DUBEL },
    {
      label: "RBD Stearine - FOB DUBEL",
      value: COMMODITY_RBD_STEARINE_FOB_DUBEL,
    },
    { label: "PFAD - FOB DUBEL", value: COMMODITY_PFAD_FOB_DUBEL },
    {
      label: "CCNO - CIF RDAM",
      value: COMMODITY_CCNO_CIF_RDAM,
    },
    {
      label: "CPKO - CIF RDAM",
      value: COMMODITY_CPKO_CIF_RDAM,
    },
  ],

  afternoon: [
    { label: "Indo CPO Dubel", value: COMMODITY_INDO_CPO_DUBEL },
    { label: "PO FOB Malaysia", value: COMMODITY_PO_FOB_MALAYSIA },
    { label: "Olein FOB Malaysia", value: COMMODITY_OLEIN_FOB_MALAYSIA },
    { label: "Stearine FOB Malaysia", value: COMMODITY_STEARINE_FOB_MALAYSIA },
    { label: "CPO FOB Malaysia", value: COMMODITY_CPO_FOB_MALAYSIA },
    { label: "RBD PKO FOB Malaysia", value: COMMODITY_RBD_PKO_FOB_MALAYSIA },
    { label: "CPKO FOB Malaysia", value: COMMODITY_CPKO_FOB_MALAYSIA },
    { label: "PFAD FOB Malaysia", value: COMMODITY_PFAD_FOB_MALAYSIA },
  ],
};

const getReutersMap = () => {
  let commodityReutersMap = {};
  for (const c of COMMODITY_REUTERS_LIST.morning) {
    commodityReutersMap[c.value] = c.label;
  }
  for (const c of COMMODITY_REUTERS_LIST.afternoon) {
    commodityReutersMap[c.value] = c.label;
  }
  return commodityReutersMap;
};
export const COMMODITY_REUTERS_MAP = getReutersMap();

export const REUTERS_TYPE_MORNING = "morning";
export const REUTERS_TYPE_AFTERNOON = "afternoon";
export const REUTERS_TYPE_LIST = [REUTERS_TYPE_MORNING, REUTERS_TYPE_AFTERNOON];
export const REUTERS_TYPE_MAP = {
  morning: "Morning",
  afternoon: "Afternoon",
};

export const MDEX_TYPE_1ST_OPENING = "1st_opening";
export const MDEX_TYPE_1ST_CLOSING = "1st_closing";
export const MDEX_TYPE_2ND_OPENING = "2nd_opening";
export const MDEX_TYPE_2ND_CLOSING = "2nd_closing";
export const MDEX_TYPE_LIST = [
  MDEX_TYPE_1ST_OPENING,
  MDEX_TYPE_1ST_CLOSING,
  MDEX_TYPE_2ND_OPENING,
  MDEX_TYPE_2ND_CLOSING,
];

export const MDEX_TYPE_MAP = {
  "1st_opening": "1st Opening",
  "1st_closing": "1st Closing",
  "2nd_opening": "2nd Opening",
  "2nd_closing": "2nd Closing",
};

export const KPB_ID_FINAL = "FINAL";

export const PPN = "ppn";

// default is 110 if failed get from server
export const getPPNMultiplier = (ppnVal = 11) => {
  return new Decimal(ppnVal + 100).div(new Decimal(100)).toNumber();
};

export const COMMODITY_WITH_FREIGHT = [
  COMMODITY_CPO_CIF_RDAM,
  COMMODITY_CCNO_CIF_RDAM,
  COMMODITY_CPKO_CIF_RDAM,
];
export const COMMODITY_WITHOUT_FEE = [COMMODITY_SOY_OIL];

export const COMMODITY_IN_EUR = [COMMODITY_SOY_OIL];
export const COMMODITY_IN_MYR = [COMMODITY_CPO_FOB_MALAYSIA, COMMODITY_CPKO_FOB_MALAYSIA];

// * MDEX CPO FEE is equal with CPO FOB MALAYSIA
export const COMMODITY_CPO_MDEX = COMMODITY_CPO_FOB_MALAYSIA;
export const COMMODITY_CPO_MDEX_SHOW = "CPO FOB Malaysia";

export const MIN_PRICE_LENGTH = 1;

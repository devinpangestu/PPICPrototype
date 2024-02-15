export const TODAY = "today";
export const LAST = "last";

export const REUTERS_TYPE_MORNING = "morning";
export const REUTERS_TYPE_AFTERNOON = "afternoon";

class Commodity {
  constructor(ID, Desc) {
    this.ID = ID;
    this.Desc = Desc;
  }
}

export const COMMODITY_LIST_REUTERS_MORNING = [
  new Commodity("soy_oil", "Soy Oil"),
  new Commodity("cpo_cif_rdam", "CPO - CIF RDAM"),
  new Commodity("cpo_fob_dubel", "CPO - FOB DUBEL"),
  new Commodity("rbd_po_cif_rdam", "RBD PO - CIF RDAM"),
  new Commodity("rbd_olein_fob_dubel", "RBD Olein - FOB DUBEL"),
  new Commodity("rbd_stearine_fob_dubel", "RBD Stearine - FOB DUBEL"),
  new Commodity("pfad_fob_dubel", "PFAD - FOB DUBEL"),
  new Commodity("ccno_cif_rdam", "CCNO - CIF RDAM"),
  new Commodity("cpko_cif_rdam", "CPKO - CIF RDAM"),
];

export const COMMODITY_LIST_REUTERS_AFTERNOON = [
  new Commodity("indo_cpo_dubel", "Indo CPO Dubel"),
  new Commodity("po_fob_malaysia", "PO FOB Malaysia"),
  new Commodity("olein_fob_malaysia", "Olein FOB Malaysia"),
  new Commodity("stearine_fob_malaysia", "Stearine FOB Malaysia"),
  new Commodity("cpo_fob_malaysia", "CPO FOB Malaysia"),
  new Commodity("rbd_pko_fob_malaysia", "RBD PKO FOB Malaysia"),
  new Commodity("cpko_fob_malaysia", "CPKO FOB Malaysia"),
  new Commodity("pfad_fob_malaysia", "PFAD FOB Malaysia"),
];

export const COMMODITY_LIST_REUTERS_MAP = {
  [REUTERS_TYPE_MORNING]: COMMODITY_LIST_REUTERS_MORNING,
  [REUTERS_TYPE_AFTERNOON]: COMMODITY_LIST_REUTERS_AFTERNOON,
};
export const PPN_MULTIPLIER = 1.11;
export const MAP_ALPHABET = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
  4: "E",
  5: "F",
  6: "G",
  7: "H",
  8: "I",
  9: "J",
  10: "K",
  11: "L",
  12: "M",
  13: "N",
  14: "O",
  15: "P",
  16: "Q",
  17: "R",
  18: "S",
  19: "T",
  20: "U",
  21: "V",
  22: "W",
  23: "X",
  24: "Y",
  25: "Z",
  26: "AA",
  27: "AB",
  28: "AC",
  29: "AD",
  30: "AE",
  31: "AF",
  32: "AG",
  33: "AH",
  34: "AI",
  35: "AJ",
  36: "AK",
  37: "AL",
  38: "AM",
  39: "AN",
  40: "AO",
  41: "AP",
  42: "AQ",
  43: "AR",
  44: "AS",
  45: "AT",
  46: "AU",
  47: "AV",
  48: "AW",
  49: "AX",
  50: "AY",
  51: "AZ",
};

export function GetAlphabet(idx) {
  const v = MAP_ALPHABET[idx];
  if (v !== undefined) {
    return v;
  }
  return "A";
}

export const MDEX_TYPE_1ST_OPENING = "1st_opening";
export const MDEX_TYPE_1ST_CLOSING = "1st_closing";
export const MDEX_TYPE_2ND_OPENING = "2nd_opening";
export const MDEX_TYPE_2ND_CLOSING = "2nd_closing";

export const LEVY = "levy";
export const BK = "bk";
export const FREIGHT = "freight";
export const GOVT_FEE = "government_fee";

export const REUTERS_TYPES = [REUTERS_TYPE_MORNING, REUTERS_TYPE_AFTERNOON];
export const MDEX_TYPES = [
  MDEX_TYPE_1ST_OPENING,
  MDEX_TYPE_1ST_CLOSING,
  MDEX_TYPE_2ND_OPENING,
  MDEX_TYPE_2ND_CLOSING,
];
export const COMMODITY_FEE_TYPES = [LEVY, BK, FREIGHT, GOVT_FEE];

export const KPB_ID_FINAL = "FINAL";
export const PROG_NOT_FOUND = "-";

export const COMMODITY_DALIAN_MAP = {
  soy_oil: "Soy Oil",
  rbd_oln: "Rbd Oln",
  soy_bean: "Soy Bean",
};

export function GetCommodityDalianDesc(id) {
  const v = COMMODITY_DALIAN_MAP[id];
  if (v !== undefined) {
    return v;
  }
  return id;
}

export const COMMODITY_CPO_FOB_MALAYSIA = "cpo_fob_malaysia";
export const COMMODITY_SOY_OIL = "soy_oil";
export const COMMODITY_CPKO_FOB_MALAYSIA = "cpko_fob_malaysia";

export const COMMODITY_CPO_MDEX = COMMODITY_CPO_FOB_MALAYSIA;

export const COMMODITY_IN_EUR = [COMMODITY_SOY_OIL];

export function IsInEUR(commodityName) {
  return COMMODITY_IN_EUR.includes(commodityName);
}

export const COMMODITY_IN_MYR = [
  COMMODITY_CPO_FOB_MALAYSIA,
  COMMODITY_CPKO_FOB_MALAYSIA,
];

export function IsInMYR(commodityName) {
  return COMMODITY_IN_MYR.includes(commodityName);
}

export const COMMODITY_WITHOUT_FEE = [COMMODITY_SOY_OIL];

export function IsWithoutFee(commodityName) {
  return COMMODITY_WITHOUT_FEE.includes(commodityName);
}

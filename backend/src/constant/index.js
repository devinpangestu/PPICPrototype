import fs from "fs";
import path from "path";

import {
  TOKEN_ISSUER,
  TOKEN_TYPE_ACCESS,
  TOKEN_TYPE_REFRESH,
  SECRET_AUTH,
  ACCESS_TOKEN_EXPIRATION,
} from "./auth.js";
import { CtxKeyTokenClaims } from "./context.js";
import { DECISION_BID, DECISION_APPROVE, DECISION_REJECT } from "./decision.js";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from "./defaults.js";
import {
  EXPORT_TYPE_OFFER,
  EXPORT_TYPE_TRN_HIST,
  EXPORT_TYPE_PPIC,
  EXPORT_TYPE_PURCHASING,
  EXPORT_TYPE_SUPPLIER_TRN_HIS,
  EXPORT_TYPE_PRICE,
  FNAME_PREFIX_OFFER,
  FNAME_PREFIX_TRN_HIST,
  FNAME_PREFIX_PPIC,
  FNAME_PREFIX_PURCHASING,
  FNAME_PREFIX_SUPPLIER_TRN_HIS,
  FNAME_PREFIX_PRICE,
  EXPORT_LANG,
  EXPORT_DEFAULT_SHEET,
  EXPORT_SHEET_DALIAN,
  EXPORT_SHEET_KPB,
  EXPORT_SHEET_REUTERS,
  EXPORT_SHEET_MDEX,
  EXPORT_WIDTH_DATE,
  EXPORT_WIDTH_DATETIME,
  EXPORT_WIDTH_PRICE,
  EXPORT_WIDTH_TEXT,
  EXPORT_WIDTH_UNIQUEID,
  ALIGN_CENTER,
} from "./export.js";
import {
  FORMAT_DATETIME,
  FORMAT_DATE,
  FORMAT_DATETIME_API,
  FORMAT_DATE_API,
} from "./formats.js";

import { MAX_PAGE_SIZE, UNLIMITED_PAGE_SIZE } from "./limits.js";
import {
  LOGISTIC_STATUS_PENDING,
  LOGISTIC_STATUS_APPROVED,
  LOGISTIC_STATUS_ADJUST,
  LOGISTIC_STATUS_REJECT,
  LOGISTIC_ACTIVITY_STATUS_APPROVAL,
  LOGISTIC_ACTIVITY_STATUS_LOADING,
  LOGISTIC_ACTIVITY_STATUS_DELIVERY,
  LOGISTIC_ACTIVITY_STATUS_DELIVERED,
  LOGISTIC_ACTIVITY_STATUS_DISCHARGED,
  TRANSPORTIR_TYPE_SEA,
  TRANSPORTIR_TYPE_LAND,
  TRANSPORTIR_TYPE_LAND_DISCHARGED,
  FILE_TYPE_NEEDED_MAP,
} from "./logistic.js";

import {
  REPORT_TYPE_OFFER_EXTERNAL,
  REPORT_TYPE_OFFER_INTERNAL,
} from "./report.js";

import {
  TODAY,
  LAST,
  REUTERS_TYPE_MORNING,
  REUTERS_TYPE_AFTERNOON,
  COMMODITY_LIST_REUTERS_MORNING,
  COMMODITY_LIST_REUTERS_AFTERNOON,
  COMMODITY_LIST_REUTERS_MAP,
  PPN_MULTIPLIER,
  MAP_ALPHABET,
  GetAlphabet,
  MDEX_TYPE_1ST_OPENING,
  MDEX_TYPE_1ST_CLOSING,
  MDEX_TYPE_2ND_OPENING,
  MDEX_TYPE_2ND_CLOSING,
  LEVY,
  BK,
  FREIGHT,
  GOVT_FEE,
  REUTERS_TYPES,
  MDEX_TYPES,
  COMMODITY_FEE_TYPES,
  KPB_ID_FINAL,
  PROG_NOT_FOUND,
  COMMODITY_DALIAN_MAP,
  GetCommodityDalianDesc,
  COMMODITY_CPO_FOB_MALAYSIA,
  COMMODITY_SOY_OIL,
  COMMODITY_CPKO_FOB_MALAYSIA,
  COMMODITY_CPO_MDEX,
  COMMODITY_IN_EUR,
  IsInEUR,
  COMMODITY_IN_MYR,
  IsInMYR,
  COMMODITY_WITHOUT_FEE,
  IsWithoutFee,
} from "./price.js";

import {
  ROLE_SUPER_ADMIN,
  ROLE_DEALER,
  ROLE_RISK_MGMT,
  ROLE_TOP_MGMT,
  ROLE_ADMIN,
} from "./roles.js";

import {
  STATUS_PENDING_ASSESSMENT,
  STATUS_PENDING_APPROVAL,
  STATUS_PENDING_BID_RESPONSE,
  STATUS_REJECTED,
  STATUS_APPROVED,
  STATUS_APPROVE,
} from "./status.js";

import {
  FORMAT_DISPLAY_DATE,
  FORMAT_DISPLAY_DATE_COMPACT,
  FORMAT_DISPLAY_DATETIME,
  FORMAT_DISPLAY_TIME,
  FORMAT_API_DATE,
  FORMAT_API_DATETIME,
} from "./moment.js";

let ExecutablePath;

const ex = process.execPath;
ExecutablePath = path.dirname(ex);

export const TokenBearerPrefix = "bearer ";
export const TokenTypeBearer = "bearer";

export const HeaderAuthorization = "Authorization";

export const WAREHOUSE_MAP = {
  marunda: "Marunda",
  bekasi: "Bekasi",
  gresik: "Gresik",
};

export const GetWarehouseDesc = (id) => WAREHOUSE_MAP[id] || id;

export const TERMS_OF_HANDOVER_MAP = {
  loco_dalam_pulau: "LOCO (dalam pulau)",
  loco_luar_pulau: "LOCO (luar pulau)",
  fob: "FOB",
  cif: "CIF",
  franco: "FRANCO",
};

export const TERMS_OF_HANDOVER_TO_PO_MAP = {
  loco_dalam_pulau: "LOCO",
  loco_luar_pulau: "LOCO",
  fob: "FOB",
  cif: "CIF",
  franco: "FRANCO",
};

export const TERMS_OF_HANDOVER_SEA = ["loco_luar_pulau", "fob"];

export const GetTermsOfHandoverDesc = (id) => TERMS_OF_HANDOVER_MAP[id] || id;

export const TERMS_OF_LOADING_MAP = {
  trucking: "Trucking",
  piping: "Piping",
};

export const GetTermsOfLoadingDesc = (id) => TERMS_OF_LOADING_MAP[id] || id;

export const TERMS_OF_PAYMENT_ID = "CBD";
export const TERMS_OF_PAYMENT_NAME = "Cash Before Delivery";

export const ENV_DEV = "DEV";
export const NSQ_URL = process.env.NSQ_URL || "localhost";
export const WrapTopicName = (topicName) => {
  if (process.env.ENV === ENV_DEV) {
    topicName = `${topicName}_${process.env.ENV}`;
  }
  return topicName;
};

export const constant = {
  TOKEN_ISSUER,
  TOKEN_TYPE_ACCESS,
  TOKEN_TYPE_REFRESH,
  SECRET_AUTH,
  ACCESS_TOKEN_EXPIRATION,
  CtxKeyTokenClaims,
  DECISION_BID,
  DECISION_APPROVE,
  DECISION_REJECT,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  EXPORT_TYPE_OFFER,
  EXPORT_TYPE_TRN_HIST,
  EXPORT_TYPE_PPIC,
  EXPORT_TYPE_PURCHASING,
  EXPORT_TYPE_SUPPLIER_TRN_HIS,
  EXPORT_TYPE_PRICE,
  FNAME_PREFIX_OFFER,
  FNAME_PREFIX_TRN_HIST,
  FNAME_PREFIX_PPIC,
  FNAME_PREFIX_PURCHASING,
  FNAME_PREFIX_SUPPLIER_TRN_HIS,
  FNAME_PREFIX_PRICE,
  EXPORT_LANG,
  EXPORT_DEFAULT_SHEET,
  EXPORT_SHEET_DALIAN,
  EXPORT_SHEET_KPB,
  EXPORT_SHEET_REUTERS,
  EXPORT_SHEET_MDEX,
  EXPORT_WIDTH_DATE,
  EXPORT_WIDTH_DATETIME,
  EXPORT_WIDTH_PRICE,
  EXPORT_WIDTH_TEXT,
  EXPORT_WIDTH_UNIQUEID,
  ALIGN_CENTER,
  FORMAT_DATETIME,
  FORMAT_DATE,
  FORMAT_DATETIME_API,
  FORMAT_DATE_API,
  MAX_PAGE_SIZE,
  UNLIMITED_PAGE_SIZE,
  LOGISTIC_STATUS_PENDING,
  LOGISTIC_STATUS_APPROVED,
  LOGISTIC_STATUS_ADJUST,
  LOGISTIC_STATUS_REJECT,
  LOGISTIC_ACTIVITY_STATUS_APPROVAL,
  LOGISTIC_ACTIVITY_STATUS_LOADING,
  LOGISTIC_ACTIVITY_STATUS_DELIVERY,
  LOGISTIC_ACTIVITY_STATUS_DELIVERED,
  LOGISTIC_ACTIVITY_STATUS_DISCHARGED,
  TRANSPORTIR_TYPE_SEA,
  TRANSPORTIR_TYPE_LAND,
  TRANSPORTIR_TYPE_LAND_DISCHARGED,
  REPORT_TYPE_OFFER_EXTERNAL,
  REPORT_TYPE_OFFER_INTERNAL,
  TODAY,
  LAST,
  REUTERS_TYPE_MORNING,
  REUTERS_TYPE_AFTERNOON,
  COMMODITY_LIST_REUTERS_MORNING,
  COMMODITY_LIST_REUTERS_AFTERNOON,
  COMMODITY_LIST_REUTERS_MAP,
  PPN_MULTIPLIER,
  MAP_ALPHABET,
  GetAlphabet,
  MDEX_TYPE_1ST_OPENING,
  MDEX_TYPE_1ST_CLOSING,
  MDEX_TYPE_2ND_OPENING,
  MDEX_TYPE_2ND_CLOSING,
  LEVY,
  BK,
  FREIGHT,
  GOVT_FEE,
  REUTERS_TYPES,
  MDEX_TYPES,
  COMMODITY_FEE_TYPES,
  KPB_ID_FINAL,
  PROG_NOT_FOUND,
  COMMODITY_DALIAN_MAP,
  GetCommodityDalianDesc,
  COMMODITY_CPO_FOB_MALAYSIA,
  COMMODITY_SOY_OIL,
  COMMODITY_CPKO_FOB_MALAYSIA,
  COMMODITY_CPO_MDEX,
  COMMODITY_IN_EUR,
  IsInEUR,
  COMMODITY_IN_MYR,
  IsInMYR,
  COMMODITY_WITHOUT_FEE,
  IsWithoutFee,
  ROLE_SUPER_ADMIN,
  ROLE_DEALER,
  ROLE_RISK_MGMT,
  ROLE_TOP_MGMT,
  ROLE_ADMIN,
  STATUS_PENDING_ASSESSMENT,
  STATUS_PENDING_APPROVAL,
  STATUS_PENDING_BID_RESPONSE,
  STATUS_REJECTED,
  STATUS_APPROVED,
  STATUS_APPROVE,
  WAREHOUSE_MAP,
  GetWarehouseDesc,
  TERMS_OF_HANDOVER_MAP,
  TERMS_OF_HANDOVER_TO_PO_MAP,
  TERMS_OF_HANDOVER_SEA,
  GetTermsOfHandoverDesc,
  TERMS_OF_LOADING_MAP,
  GetTermsOfLoadingDesc,
  TERMS_OF_PAYMENT_ID,
  TERMS_OF_PAYMENT_NAME,
  ENV_DEV,
  WrapTopicName,
  ExecutablePath,
  FILE_TYPE_NEEDED_MAP,
  FORMAT_DISPLAY_DATE,
  FORMAT_DISPLAY_DATE_COMPACT,
  FORMAT_DISPLAY_DATETIME,
  FORMAT_DISPLAY_TIME,
  FORMAT_API_DATE,
  FORMAT_API_DATETIME,
};

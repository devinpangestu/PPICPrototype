import xl from "excel4node";
import db from "../../models/index.js";
import { constant } from "../../constant/index.js";
import { Op } from "sequelize";
import {
  parsingDateToString,
  parsingStringToDateEarly,
  parsingStringToDateLate,
} from "../parsing.js";
import { toExportTransactionAPIStruct } from "../apiStruct/transactions.js";
import {
  ConstructHeaderPurchasing,
  ConstructBodyPurchasing,
  ConstructHeaderPPIC,
  ConstructBodyPPIC,
} from "../excelConstructor/export_purchasing.js";

import { compare } from "mathjs";

export const exportPPICSchedule = async (ws, styles, data) => {
  let sheetOffer = ws;
  return await writePPICSchedule(sheetOffer, styles, data);
};

const writePPICSchedule = async (ws, styles, data) => {
  let sheetOffer = ws;
  sheetOffer = await ConstructHeaderPPIC(sheetOffer, styles);
  sheetOffer = await ConstructBodyPPIC(sheetOffer, styles, data);
  return sheetOffer;
};

export const exportPurchasingSchedule = async (ws, styles, data) => {
  let sheetOffer = ws;
  return await writePurchasingSchedule(sheetOffer, styles, data);
};

const writePurchasingSchedule = async (ws, styles, data) => {
  let sheetOffer = ws;
  sheetOffer = await ConstructHeaderPurchasing(sheetOffer, styles);
  sheetOffer = await ConstructBodyPurchasing(sheetOffer, styles, data);
  return sheetOffer;
};

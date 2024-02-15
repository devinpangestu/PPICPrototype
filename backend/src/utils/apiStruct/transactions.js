import db from "../../models/index.js";
import {
  parsingStringToDateEarly,
  parsingStringToDateLate,
} from "../parsing.js";
import { constant } from "../../constant/index.js";
import { Op } from "sequelize";
import { toExportOfferAPIStruct } from "./offers.js";

export async function toExportTransactionAPIStruct(d, genReportInternal) {
  const [apiOffer, err] = await toExportOfferAPIStruct(d, true);

  return [apiOffer, err];
}

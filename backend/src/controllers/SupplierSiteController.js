import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";

export const getAllMapSuppSite = async (req, res) => {
  try {
    const suppSite = await db.SUPPLIER_SITE.findAll();
    if (suppSite.length > 0) {
      return successResponse(res, suppSite);
    } else {
      return errorResponse(res, "No data found", 404);
    }
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

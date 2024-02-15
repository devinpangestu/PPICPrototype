import db from "../../models/index.js";
import {
  parsingStringToDateEarly,
  parsingStringToDateLate,
} from "../parsing.js";
import { constant } from "../../constant/index.js";
import { Op } from "sequelize";
import rawSPK from "../raw/rawSPK.js";
import rawSPKBongkar from "../raw/rawSPKBongkar.js";

// Helper function for fetching files
async function fetchFiles(logisticOfferId) {
  const txFiles = await db.FILES.findAll({
    where: { unique_id: logisticOfferId },
  });
  for (let key in txFiles) {
    const file = txFiles[key].dataValues;
    file.name = `${txFiles[key].dataValues.type.toUpperCase()}-${
      txFiles[key].dataValues.unique_id
    }.pdf`;
  }
  return txFiles.map((file) => file.dataValues);
}

// Helper function for fetching offers with user and related data
async function fetchOfferWithUserData(commodityOfferId) {
  return await db.OFFERS.findOne({
    where: { unique_id: commodityOfferId },
    include: [
      {
        model: db.USERS,
        as: "crtd_by",
        attributes: ["id", "name", "employee_id"],
      },
      // Include other associations here
    ],
  });
}

// Helper function for fetching budget
async function fetchBudget(handoverLocationId, warehouseId) {
  return await db.MASTER_BUDGET_TRANSPORTIR.findOne({
    where: {
      handover_location_id: handoverLocationId,
      warehouse_id: warehouseId,
    },
    include: [
      // Include necessary associations here
    ],
  });
}

// Helper function for fetching SPK
async function fetchSPK(logisticOfferId, commodityOfferId, type) {
  const spk = await db.LOG_SPK.findOne({
    where: {
      logistic_offer_id: logisticOfferId,
      commodity_offer_id: commodityOfferId,
      type,
    },
  });

  return spk;
}

export async function toAPIStruct(d, genReportInternal) {
  try {
    const apiFiles = await fetchFiles(d.logistic_offer_id);

    const cOffer = await fetchOfferWithUserData(d.commodity_offer_id);

    const budget = d.budget;

    let spk = await fetchSPK(d.id, d.commodity_offer_id, "pemuatan");

    let spkBongkar = await fetchSPK(d.id, d.commodity_offer_id, "pembongkaran");

    if (spk == null) {
      spk = rawSPK;
    }
    if (spkBongkar == null) {
      spkBongkar = rawSPKBongkar;
    }

    const apiLogisticOffer = {
      logistic_offer: d,
      commodity_offer: cOffer,
      budget,
      files: apiFiles,
      spk,
      spk_bongkar: spkBongkar,
    };

    return [apiLogisticOffer, false];
  } catch (error) {
    // Handle errors appropriately
    return [null, true];
  }
}

class Decimal {
  constructor(value) {
    this.value = parseFloat(value);
  }

  sub(value) {
    this.value -= parseFloat(value);
    return this;
  }

  mul(value) {
    this.value *= parseFloat(value);
    return this;
  }

  div(value) {
    if (parseFloat(value) === 0) {
      throw new Error("Division by zero is not allowed.");
    }
    this.value /= parseFloat(value);
    return this;
  }

  round(decimalPlaces) {
    const multiplier = 10 ** decimalPlaces;
    this.value = Math.round(this.value * multiplier) / multiplier;
    return this;
  }

  toString() {
    return this.value.toFixed(2);
  }
}

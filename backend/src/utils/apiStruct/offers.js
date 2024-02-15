import db from "../../models/index.js";
import {
  parsingStringToDateEarly,
  parsingStringToDateLate,
} from "../parsing.js";
import { constant } from "../../constant/index.js";
import { Op } from "sequelize";

export async function toAPIStruct(d, genReportInternal) {
  const apiOffer = {
    Offer: d,
  };
  apiOffer.kpb_exclude = null;
  apiOffer.kpb_include = null;
  const reportExternal = await db.REPORTS.findOne({
    where: { offer_id: d.id, type: constant.REPORT_TYPE_OFFER_EXTERNAL },
  });

  apiOffer.Offer = d;
  apiOffer.report_url_external = reportExternal;

  // * update show all report (internal and external), refactor later as the flag genReportInternal is not necessary anymore
  // if (genReportInternal) {

  const reportInternal = await db.REPORTS.findOne({
    where: { offer_id: d.id, type: constant.REPORT_TYPE_OFFER_INTERNAL },
  });

  apiOffer.report_url_internal = reportInternal;
  // }

  const spk = [];
  const spkBongkar = [];

  if (d.unique_id === null || d.unique_id === undefined) {
  } else {
    const txSPK = await db.LOG_SPK.findOne({
      where: {
        commodity_offer_id: d.unique_id,
        type: "pemuatan",
      },
    });
    const txSPKBongkar = await db.LOG_SPK.findOne({
      where: {
        commodity_offer_id: d.unique_id,
        type: "pembongkaran",
      },
    });
  }

  apiOffer.spk = spk;

  apiOffer.SPKBongkar = spkBongkar;

  // const files = [];
  // for (const v of d.LogisticOffers) {
  //   const tempF = [];
  //   const txFiles = await db.LOG_OFFERS.findOne({
  //     where: { id: v.LogisticOfferID },
  //   });
  //   tempF.push(txFiles);

  //   files.push(...tempF);
  // }
  
  // const mapLogisticFiles = {};
  // const apiFiles = [];
  // for (const v of files) {
  //   apiFiles.push(toAPIStruct(v));
  //   const mapK = `${v.UniqueID}-${v.Type}`;
  //   mapLogisticFiles[mapK] = true;
  // }

  // apiOffer.Files = apiFiles;

  // const f = {
  //   DocumentsCompleted: true,
  // };
  // for (const v of d.LogisticOffers) {
  //   if (v.Status !== constant.STATUS_APPROVED) {
  //     continue;
  //   }

  //   switch (v.Type) {
  //     case constant.TRANSPORTIR_TYPE_SEA:
  //       if (!f.Sea.Valid) {
  //         f.Sea.Valid = true;
  //       }
  //       f.Sea.Decimal = f.Sea.Decimal.add(v.Quantity);

  //       for (const docType of ["spal"]) {
  //         const mapK = `${v.LogisticOfferID}-${docType}`;
  //         if (!mapLogisticFiles[mapK]) {
  //
  //           f.DocumentsCompleted = false;
  //         }
  //       }

  //       break;

  //     case constant.TRANSPORTIR_TYPE_LAND:
  //       if (!f.Land.Valid) {
  //         f.Land.Valid = true;
  //       }
  //       f.Land.Decimal = f.Land.Decimal.add(v.Quantity);

  //       for (const docType of ["spad"]) {
  //         const mapK = `${v.LogisticOfferID}-${docType}`;
  //         if (!mapLogisticFiles[mapK]) {

  //           f.DocumentsCompleted = false;
  //         }
  //       }
  //       break;
  //   }
  // }

  // let seaFulfilled = true;
  // if (constant.TERMS_OF_HANDOVER_SEA.includes(d.TermsOfHandover)) {
  //   seaFulfilled = false;
  //   if (f.Sea.Valid && f.Sea.Decimal.eq(d.Quantity)) {
  //     seaFulfilled = true;
  //   }
  // }

  // if (seaFulfilled && f.Land.Valid && f.Land.Decimal.eq(d.Quantity)) {
  //   f.IsFulfilled = true;
  // }

  // let seaOffersCount = 0;
  // for (const v of d.LogisticOffers) {
  //   if (v.Type === "land") {
  //     continue;
  //   }
  //   seaOffersCount++;
  // }

  // if (seaOffersCount !== spk.length) {
  //   f.DocumentsCompleted = false;
  // }

  // apiOffer.LogisticFulfillment = f;

  const kpbRow = {};
  const resKPB = await db.PRICE_KPB.findOne({
    where: {
      date_: {
        [Op.between]: [
          parsingStringToDateEarly(d.datetime),
          parsingStringToDateLate(d.datetime),
        ],
      },
      id: "FINAL",
    },
  });
  // kpb equivalent

  let kpbEquivalentInclude;
  let multiplier = new Decimal(0);
  let ffa;
  if (
    apiOffer.Offer.quality_ffa === null ||
    apiOffer.Offer.quality_ffa === undefined
  ) {
    ffa = null;
  } else {
    ffa = apiOffer.Offer.quality_ffa.toString();
  }

  if (resKPB === null) {
  } else {
    if (ffa < 12) {
      if (ffa < 5.01) {
        multiplier = new Decimal(0);
      } else if (ffa <= 5.5) {
        multiplier = new Decimal(1.25);
      } else if (ffa <= 6) {
        multiplier = new Decimal(1.5);
      } else if (ffa <= 7) {
        multiplier = new Decimal(1.75);
      } else if (ffa <= 8) {
        multiplier = new Decimal(2);
      } else if (ffa <= 9) {
        multiplier = new Decimal(2.25);
      } else if (ffa <= 10) {
        multiplier = new Decimal(2.5);
      } else if (ffa < 12) {
        multiplier = new Decimal(2.75);
      }

      kpbEquivalentInclude = new Decimal(100)
        .sub(
          new Decimal(apiOffer.Offer.quality_ffa)
            .sub(new Decimal(5))
            .mul(multiplier)
        )
        .div(new Decimal(100))
        .mul(resKPB.dataValues.price_include)
        .round(2);
    } else {
      if (ffa < 15) {
        multiplier = new Decimal(19.25);
      } else if (ffa <= 20) {
        multiplier = new Decimal(25);
      } else if (ffa > 20) {
        multiplier = new Decimal(30);
      }

      kpbEquivalentInclude = new Decimal(resKPB.dataValues.price_include)
        .mul(new Decimal(100).sub(multiplier))
        .div(new Decimal(100))
        .round(2);
    }
  }
  if (!kpbEquivalentInclude) {
  } else {
    const kpbEquivalentExclude = new Decimal(kpbEquivalentInclude.value)
      .div(new Decimal(1.1))
      .round(2);

    apiOffer.kpb_exclude = kpbEquivalentExclude.value;

    apiOffer.kpb_include = kpbEquivalentInclude.value;
  }

  return [apiOffer, null];
}

export async function toTransactionHistoryAPIStruct(d, genReportInternal) {
  const apiOffer = {
    Offer: d,
  };
  apiOffer.kpb_exclude = null;
  apiOffer.kpb_include = null;
  const reportExternal = await db.REPORTS.findOne({
    where: { offer_id: d.id, type: constant.REPORT_TYPE_OFFER_EXTERNAL },
  });

  apiOffer.Offer = d;
  apiOffer.report_url_external = reportExternal;

  // * update show all report (internal and external), refactor later as the flag genReportInternal is not necessary anymore
  // if (genReportInternal) {

  const reportInternal = await db.REPORTS.findOne({
    where: { offer_id: d.id, type: constant.REPORT_TYPE_OFFER_INTERNAL },
  });

  apiOffer.report_url_internal = reportInternal;
  // }

  const spk = [];
  const spkBongkar = [];

  if (d.unique_id === null || d.unique_id === undefined) {
  } else {
    const txSPK = await db.LOG_SPK.findOne({
      where: {
        commodity_offer_id: d.unique_id,
        type: "pemuatan",
      },
    });
    const txSPKBongkar = await db.LOG_SPK.findOne({
      where: {
        commodity_offer_id: d.unique_id,
        type: "pembongkaran",
      },
    });
  }

  apiOffer.spk = spk;

  apiOffer.SPKBongkar = spkBongkar;

  const kpbRow = {};
  const resKPB = await db.PRICE_KPB.findOne({
    where: {
      date_: {
        [Op.between]: [
          parsingStringToDateEarly(d.datetime),
          parsingStringToDateLate(d.datetime),
        ],
      },
      id: "FINAL",
    },
  });
  // kpb equivalent

  let kpbEquivalentInclude;
  let multiplier = new Decimal(0);
  let ffa;

  if (
    apiOffer?.Offer.offer.quality_ffa === null ||
    apiOffer?.Offer.offer.quality_ffa === undefined
  ) {
    ffa = null;
  } else {
    ffa = apiOffer.Offer.offer.quality_ffa.toString();
  }

  if (resKPB === null) {
  } else {
    if (ffa < 12) {
      if (ffa < 5.01) {
        multiplier = new Decimal(0);
      } else if (ffa <= 5.5) {
        multiplier = new Decimal(1.25);
      } else if (ffa <= 6) {
        multiplier = new Decimal(1.5);
      } else if (ffa <= 7) {
        multiplier = new Decimal(1.75);
      } else if (ffa <= 8) {
        multiplier = new Decimal(2);
      } else if (ffa <= 9) {
        multiplier = new Decimal(2.25);
      } else if (ffa <= 10) {
        multiplier = new Decimal(2.5);
      } else if (ffa < 12) {
        multiplier = new Decimal(2.75);
      }

      kpbEquivalentInclude = new Decimal(100)
        .sub(
          new Decimal(apiOffer.Offer.offer.quality_ffa)
            .sub(new Decimal(5))
            .mul(multiplier)
        )
        .div(new Decimal(100))
        .mul(resKPB.price_include)
        .round(2);
    } else {
      if (ffa < 15) {
        multiplier = new Decimal(19.25);
      } else if (ffa <= 20) {
        multiplier = new Decimal(25);
      } else if (ffa > 20) {
        multiplier = new Decimal(30);
      }

      kpbEquivalentInclude = new Decimal(resKPB.price_include)
        .mul(new Decimal(100).sub(multiplier))
        .div(new Decimal(100))
        .round(2);
    }
  }

  if (!kpbEquivalentInclude) {
  } else {
    const kpbEquivalentExclude = new Decimal(kpbEquivalentInclude.value)
      .div(new Decimal(1.1))
      .round(2);

    apiOffer.kpb_exclude = kpbEquivalentExclude.value;

    apiOffer.kpb_include = kpbEquivalentInclude.value;
  }

  return [apiOffer, null];
}

export const GetApproved = async (year) => {
  
  const offers = await db.OFFERS.findAndCountAll({
    where: {
      datetime: {
        [Op.between]: [
          parsingStringToDateEarly(new Date(year, 0, 1)),
          parsingStringToDateLate(new Date(year, 11, 31)),
        ],
      },
      status: "approved",
      [Op.not]: [{ terms_of_handover: "franco" }],
    },
    include: [
      {
        model: db.USERS,
        as: "crtd_by",
        attributes: ["id", "name", "employee_id"],
      },
      {
        model: db.USERS,
        as: "updtd_by",
        attributes: ["id", "name", "employee_id"],
      },
      {
        model: db.USERS,
        as: "dealer",
        attributes: ["id", "name", "employee_id"],
      },
      {
        model: db.USERS,
        as: "top_mgmt",
        attributes: ["id", "name", "employee_id"],
      },
      {
        model: db.USERS,
        as: "risk_mgmt",
        attributes: ["id", "name", "employee_id"],
      },
      {
        model: db.m_cmdty,
        as: "cmdty",
      },
      {
        model: db.m_whs,
        as: "whs",
      },
      {
        model: db.mhOverLoc,
        as: "hOver_Loc",
      },
      {
        model: db.SUPPLIERS,
        as: "spplr",
      },
    ],
  });

  await Promise.all(
    offers.rows.map(async (offer) => {
      const uniqueId = offer.dataValues.unique_id;
      const logisticOffers = await db.LOG_OFFERS.findAll({
        where: { commodity_offer_id: uniqueId },
        include: [
          {
            model: db.LOG_TRANSPORTIRS,
            as: "trnsprtr",
          },
          {
            model: db.LOG_TRANSPORTIR_SHIP,
            as: "ship",
          },
        ],
      });

      offer.dataValues.logistic_offers = logisticOffers.map((logisticOffer) => {
        const { trnsprtr } = logisticOffer.dataValues;
        trnsprtr.dataValues.types = JSON.parse(trnsprtr.dataValues.types);
        return logisticOffer.dataValues;
      });

      for (let key in offers.rows) {
        if (offers.rows[key].dataValues.top_mgmt === null) {
          offers.rows[key].dataValues.top_mgmt = {
            id: null,
            name: null,
            employee_id: null,
          };
        }
        if (offers.rows[key].dataValues.risk_mgmt === null) {
          offers.rows[key].dataValues.risk_mgmt = {
            id: null,
            name: null,
            employee_id: null,
          };
        }
      }
    })
  );
  return offers.rows;
};

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

export async function toExportOfferAPIStruct(d, genReportInternal) {
  const apiOffer = {
    Offer: d,
  };

  apiOffer.kpb_exclude = null;
  apiOffer.kpb_include = null;
  const reportExternal = await db.REPORTS.findOne({
    where: { offer_id: d.id, type: constant.REPORT_TYPE_OFFER_EXTERNAL },
  });

  apiOffer.Offer = d;
  apiOffer.report_url_external = reportExternal;

  // * update show all report (internal and external), refactor later as the flag genReportInternal is not necessary anymore
  // if (genReportInternal) {

  const reportInternal = await db.REPORTS.findOne({
    where: { offer_id: d.id, type: constant.REPORT_TYPE_OFFER_INTERNAL },
  });

  apiOffer.report_url_internal = reportInternal;
  // }

  const spk = [];
  const spkBongkar = [];

  if (d.unique_id === null || d.unique_id === undefined) {
  } else {
    const txSPK = await db.LOG_SPK.findOne({
      where: {
        commodity_offer_id: d.unique_id,
        type: "pemuatan",
      },
    });
    const txSPKBongkar = await db.LOG_SPK.findOne({
      where: {
        commodity_offer_id: d.unique_id,
        type: "pembongkaran",
      },
    });
    apiOffer.spk = spk;
    apiOffer.SPKBongkar = spkBongkar;

    if (txSPK) {
      apiOffer.spk = txSPK;
    }
    if (txSPKBongkar) {
      apiOffer.SPKBongkar = txSPKBongkar;
    }
  }

  const kpbRow = {};
  const resKPB = await db.PRICE_KPB.findOne({
    where: {
      date_: {
        [Op.between]: [
          parsingStringToDateEarly(d.datetime),
          parsingStringToDateLate(d.datetime),
        ],
      },
      id: "FINAL",
    },
  });

  // kpb equivalent

  let kpbEquivalentInclude;
  let multiplier = new Decimal(0);
  let ffa;

  if (
    apiOffer.Offer?.quality_ffa === null ||
    apiOffer.Offer?.quality_ffa === undefined
  ) {
    ffa = null;
  } else {
    ffa = apiOffer.Offer?.quality_ffa;
  }

  if (resKPB === null) {
  } else {
    if (ffa < 12) {
      if (ffa < 5.01) {
        multiplier = new Decimal(0);
      } else if (ffa <= 5.5) {
        multiplier = new Decimal(1.25);
      } else if (ffa <= 6) {
        multiplier = new Decimal(1.5);
      } else if (ffa <= 7) {
        multiplier = new Decimal(1.75);
      } else if (ffa <= 8) {
        multiplier = new Decimal(2);
      } else if (ffa <= 9) {
        multiplier = new Decimal(2.25);
      } else if (ffa <= 10) {
        multiplier = new Decimal(2.5);
      } else if (ffa < 12) {
        multiplier = new Decimal(2.75);
      }

      kpbEquivalentInclude = new Decimal(100)
        .sub(
          new Decimal(apiOffer.Offer.quality_ffa)
            .sub(new Decimal(5))
            .mul(multiplier)
        )
        .div(new Decimal(100))
        .mul(resKPB.dataValues.price_include)
        .round(2);
    } else {
      if (ffa < 15) {
        multiplier = new Decimal(19.25);
      } else if (ffa <= 20) {
        multiplier = new Decimal(25);
      } else if (ffa > 20) {
        multiplier = new Decimal(30);
      }

      kpbEquivalentInclude = new Decimal(resKPB.dataValues.price_include)
        .mul(new Decimal(100).sub(multiplier))
        .div(new Decimal(100))
        .round(2);
    }
  }
  if (!kpbEquivalentInclude) {
  } else {
    const kpbEquivalentExclude = new Decimal(kpbEquivalentInclude.value)
      .div(new Decimal(1.1))
      .round(2);

    apiOffer.kpb_exclude = kpbEquivalentExclude.value;

    apiOffer.kpb_include = kpbEquivalentInclude.value;
  }

  return [apiOffer, null];
}

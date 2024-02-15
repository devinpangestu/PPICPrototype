import xl from "excel4node";
import db from "../../models/index.js";
import { constant } from "../../constant/index.js";
import { Op } from "sequelize";
import {
  parsingStringToDateEarly,
  parsingStringToDateLate,
} from "../parsing.js";
import { toExportOfferAPIStruct } from "../apiStruct/offers.js";

export const exportOfferData = async (ws, styles, fromDate, toDate) => {
  let sheetOffer = ws;

  const filter = {
    fromDate,
    toDate,
    pageSize: constant.UNLIMITED_PAGE_SIZE,
  };

  const offers = await history(db, filter);

  sheetOffer.cell(1, 1).string("Offer Data").style(styles.Heading.Plain);

  sheetOffer
    .cell(2, 1)
    .string(`${fromDate} - ${toDate}`)
    .style(styles.Heading.Plain);

  return writeOfferData(sheetOffer, styles, offers);
};

const writeOfferData = (ws, styles, offers) => {
  let sheetOffer = ws;
  sheetOffer
    .cell(1, 1, true)
    .string("Offer Data")
    .style(styles.TableHead.Bordered);

  return sheetOffer;
};

async function history(db, filter) {
  try {
    if (filter.pageNumber == 0) {
      filter.pageNumber = constant.DEFAULT_PAGE_NUMBER;
    }
    if (filter.pageSize == 0) {
      filter.pageSize = constant.DEFAULT_PAGE_SIZE;
    }
    let offset;
    let limit;
    if (filter.pageSize != constant.UNLIMITED_PAGE_SIZE) {
      offset = (filter.pageNumber - 1) * filter.pageSize;
      limit = filter.pageSize;
    }

    const offers = await db.OFFERS.findAll({
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name", "employee_id"],
          order: [["updated_at", "DESC"]],
        },
        {
          model: db.USERS,
          as: "updtd_by",
          attributes: ["id", "name", "employee_id"],
          order: [["updated_at", "DESC"]],
        },
        {
          model: db.USERS,
          as: "dealer",
          attributes: ["id", "name", "employee_id"],
          order: [["updated_at", "DESC"]],
        },
        {
          model: db.USERS,
          as: "top_mgmt",
          attributes: ["id", "name", "employee_id"],
          order: [["updated_at", "DESC"]],
        },
        {
          model: db.USERS,
          as: "risk_mgmt",
          attributes: ["id", "name", "employee_id"],
          order: [["updated_at", "DESC"]],
        },
        {
          model: db.m_cmdty,
          as: "cmdty",
          order: [["updated_at", "DESC"]],
        },
        {
          model: db.m_whs,
          as: "whs",
          order: [["updated_at", "DESC"]],
        },
        {
          model: db.mhOverLoc,
          as: "hOver_Loc",
          order: [["updated_at", "DESC"]],
        },
        {
          model: db.SUPPLIERS,
          as: "spplr",
          order: [["updated_at", "DESC"]],
        },
        {
          model: db.LOG_OFFERS,
          as: "lOffers",
        },
      ],
      where: {
        datetime: {
          [Op.between]: [
            parsingStringToDateEarly(filter.fromDate),
            parsingStringToDateLate(filter.toDate),
          ],
        },
      },
      offset,
      limit,
    });

    const apiOffers = await Promise.all(
      offers.map(async (row) => {
        const [apiOffer, error] = await toExportOfferAPIStruct(row, true);
        return apiOffer;
      })
    );

    return apiOffers;
  } catch (error) {
    throw error;
  }
}

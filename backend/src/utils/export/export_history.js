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
  ConstructHeaderHistory,
  ConstructHeaderBudgetFreight,
  ConstructBodyHistory,
  ConstructBodyBudgetFreight,
} from "../excelConstructor/export_history.js";
import {
  ConstructHeaderHistoryV2,
  ConstructHeaderBudgetFreightV2,
  ConstructBodyHistoryV2,
  ConstructBodyBudgetFreightV2,
} from "../excelConstructor/export_history_v2.js";
import { compare } from "mathjs";

export const exportTrnHist = async (ws, ws2, styles, fromDate, toDate) => {
  let sheetOffer = ws;
  let budgetFreightSheetOffer = ws2;
  const filter = {
    fromDate,
    toDate,
    pageSize: constant.UNLIMITED_PAGE_SIZE,
  };

  const offers = await TransactionsList(db, filter);
  const budgetFreightKapal = await db.MASTER_ROUTE_LOCATION.findAll({
    where: { types: "ship", deleted_at: null },
    include: [
      {
        model: db.mhOverLoc,
        as: "hOver_loc",
      },
      {
        model: db.mhOverLoc,
        as: "dstn_loc",
      },
    ],
  });
  const budgetFreightTruk = await db.MASTER_ROUTE_LOCATION.findAll({
    where: { types: "discharged_truck", deleted_at: null },
    include: [
      {
        model: db.mhOverLoc,
        as: "hOver_loc",
      },
      {
        model: db.mhOverLoc,
        as: "dstn_loc",
      },
    ],
  });
  return await writeTransactionHistory(
    sheetOffer,
    budgetFreightSheetOffer,
    styles,
    offers,
    budgetFreightKapal,
    budgetFreightTruk
  );
};

const writeTransactionHistory = async (
  ws,
  ws2,
  styles,
  offers,
  budgetFreightKapal,
  budgetFreightTruk
) => {
  let sheetOffer = ws;
  let budgetFreightSheetOffer = ws2;
  sheetOffer = await ConstructHeaderHistory(sheetOffer, styles);
  sheetOffer = await ConstructBodyHistory(sheetOffer, styles, offers);
  budgetFreightSheetOffer = await ConstructHeaderBudgetFreight(
    budgetFreightSheetOffer,
    styles
  );
  budgetFreightSheetOffer = await ConstructBodyBudgetFreight(
    budgetFreightSheetOffer,
    styles,
    budgetFreightKapal,
    budgetFreightTruk
  );

  return sheetOffer;
};

const TransactionsList = async (db, filter) => {
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

  const transactions = await db.OFFERS.findAll({
    as: "offer",
    attributes: {
      include: [["risk_mgmt_price_recommendation", "risk_mgmt_price_rec"]],
      exclude: ["risk_mgmt_price_recommendation"],
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
      {
        model: db.LOG_OFFERS,
        as: "lOffers",
        attributes: {
          include: [
            ["actual_loading_updated_at", "actual_loading_up_at"],
            ["actual_loading_updated_by", "actual_loading_up_by"],
            ["logistic_transaction_id", "logistic_trx_id"],
          ],
        },
      },
    ],

    where: {
      datetime: {
        [Op.between]: [
          parsingStringToDateEarly(filter.fromDate),
          parsingStringToDateLate(filter.toDate),
        ],
      },
      deleted_at: null,
      status: "approved",
    },
    offset,
    limit,
  });

  const Offer = await Promise.all(
    transactions.map(async (row) => {
      const [Offer, err] = await toExportTransactionAPIStruct(row, true);
      return Offer;
    })
  );

  return Offer;
};

export const exportTrnHistV2 = async (ws, ws2, styles, fromDate, toDate) => {
  let sheetOffer = ws;
  let budgetFreightSheetOffer = ws2;
  const filter = {
    fromDate,
    toDate,
    pageSize: constant.UNLIMITED_PAGE_SIZE,
  };

  //for worksheet transaction history
  const offers = await TransactionsListV2(db, filter);

  //for worksheet freight
  const budgetFreightKapal = await db.MASTER_ROUTE_LOCATION.findAll({
    where: { types: "ship", deleted_at: null },
    include: [
      {
        model: db.mhOverLoc,
        as: "hOver_loc",
      },
      {
        model: db.mhOverLoc,
        as: "dstn_loc",
      },
    ],
  });

  const budgetFreightTruk = await db.MASTER_ROUTE_LOCATION.findAll({
    where: { types: "discharged_truck", deleted_at: null },
    include: [
      {
        model: db.mhOverLoc,
        as: "hOver_loc",
      },
      {
        model: db.mhOverLoc,
        as: "dstn_loc",
      },
    ],
  });

  return await writeTransactionHistoryV2(
    sheetOffer,
    budgetFreightSheetOffer,
    styles,
    offers,
    budgetFreightKapal,
    budgetFreightTruk
  );
};

const writeTransactionHistoryV2 = async (
  ws,
  ws2,
  styles,
  offers,
  budgetFreightKapal,
  budgetFreightTruk
) => {
  let sheetOffer = ws;
  let budgetFreightSheetOffer = ws2;

  budgetFreightSheetOffer = await ConstructHeaderBudgetFreightV2(
    budgetFreightSheetOffer,
    styles
  );

  budgetFreightSheetOffer = await ConstructBodyBudgetFreightV2(
    budgetFreightSheetOffer,
    styles,
    budgetFreightKapal,
    budgetFreightTruk
  );

  sheetOffer = await ConstructHeaderHistoryV2(sheetOffer, styles);

  sheetOffer = await ConstructBodyHistoryV2(sheetOffer, styles, offers);

  return sheetOffer;
};

const TransactionsListV2 = async (db, filter) => {
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
  const transactions = await db.OFFERS.findAll({
    attributes: {
      include: [["risk_mgmt_price_recommendation", "risk_mgmt_price_rec"]],
      exclude: [
        "risk_mgmt_price_recommendation",
        "created_by_id",
        "updated_by_id",
        "dealer_id",
        "top_mgmt_id",
        "risk_mgmt_id",
        "commodity_id",
        "warehouse_id",
        "handover_location_id",
        "supplier_id",
        "unique_id",
      ],
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
      {
        model: db.LOG_OFFERS,
        as: "lOffers",
        attributes: {
          include: [
            ["actual_loading_updated_at", "actual_loading_up_at"],
            ["actual_loading_updated_by", "actual_loading_up_by"],
            ["logistic_transaction_id", "logistic_trx_id"],
          ],
          exclude: [
            "actual_loading_updated_at",
            "actual_loading_updated_by",
            "logistic_transaction_id",
          ],
        },
        include: [
          {
            model: db.LOG_TRANSPORTIRS,
            as: "trnsprtr",
            attributes: ["name"],
          },
          {
            model: db.LOG_TRANSPORTIR_SHIP,
            as: "ship",
            attributes: ["name"],
          },
          {
            model: db.MASTER_ROUTE_LOCATION,
            as: "sRoute",
            include: [
              {
                model: db.mhOverLoc,
                as: "hOver_loc",
                attributes: ["name"],
              },
              {
                model: db.mhOverLoc,
                as: "dstn_loc",
                attributes: ["name"],
              },
            ],
            attributes: ["id"],
          },
          {
            model: db.MASTER_ROUTE_LOCATION,
            as: "dRoute",
            include: [
              {
                model: db.mhOverLoc,
                as: "hOver_loc",
                attributes: ["name"],
              },
              {
                model: db.mhOverLoc,
                as: "dstn_loc",
                attributes: ["name"],
              },
            ],
            attributes: ["id"],
          },
        ],
      },
    ],

    where: {
      datetime: {
        [Op.between]: [
          parsingStringToDateEarly(filter.fromDate),
          parsingStringToDateLate(filter.toDate),
        ],
      },
      deleted_at: null,
      status: "approved",
    },
    order: [["datetime", "ASC"]],
    offset,
    limit,
  });

  const Offer = await Promise.all(
    transactions.map(async (row) => {
      const [Offer, err] = await toExportTransactionAPIStruct(row, true);
      return Offer;
    })
  );

  return Offer;
};

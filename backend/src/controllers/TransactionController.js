import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op, literal, Sequelize } from "sequelize";
import {
  parsingDateToString,
  parsingStringToDateEarly,
  parsingStringToDateLate,
  parseID,
} from "../utils/parsing.js";
import { constant } from "../constant/index.js";
import { getUserID } from "../utils/auth.js";
import { toTransactionHistoryAPIStruct } from "../utils/apiStruct/offers.js";
import { filterDoubleFind, filterDoubleFindCount } from "../utils/filter.js";

export const TransactionList = async (req, res) => {
  const { page_number, page_size, from_date, to_date, search_PO } = req.query;
  try {
    console.log(16);
    const whereOfferClause = {
      [Op.and]: [
        {
          [Op.or]: [{ deleted_at: null }],
        },
      ],
    };

    if (from_date && to_date) {
      whereOfferClause[Op.and].push({
        submission_date: {
          [Op.between]: [
            parsingStringToDateEarly(from_date),
            parsingStringToDateLate(to_date),
          ],
        },
      });
    }

    if (search_PO) {
      whereOfferClause[Op.and].push({
        po_number: {
          [Op.like]: `%${search_PO}%`,
        },
      });
    }
    const transactions = await db.OFFERS.findAndCountAll({
      where: whereOfferClause,
      order: [["submission_date", "DESC"]],
      limit: page_size,
      offset: page_size * (page_number - 1),
    });

    return successResponse(req, res, {
      transactions: transactions.rows,
      total: transactions.count,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const TransactionNeedActionMinDate = async (req, res) => {
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const minDatetime = await db.OFFERS.min("submission_date", {
      where: {
        deleted_at: null,
        flag_status: ["A", "C", "G"],
      },
    });

    if (!minDatetime) {
      return successResponse(req, res, {
        min_date: parsingDateToString(new Date()),
      });
    }

    return successResponse(req, res, {
      min_date: parsingDateToString(minDatetime),
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const TransactionPOList = async (req, res) => {
  const {
    page_number,
    page_size,
    from_date,
    to_date,
    search_PO,
    supplier_id,
    po_number,
    sku_code,
  } = req.query;
  try {
    console.log(16);
    let getAllPONumber;
    const whereOfferClause = {
      [Op.and]: [
        {
          [Op.or]: [
            {
              po_number: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.not]: "",
              },
            },
          ],
        },
        { deleted_at: null },
      ],
    };
    if (!po_number) {
      if (from_date && to_date) {
        whereOfferClause[Op.and].push({
          submission_date: {
            [Op.between]: [
              parsingStringToDateEarly(from_date),
              parsingStringToDateLate(to_date),
            ],
          },
        });
      }
      if (search_PO) {
        whereOfferClause[Op.and].push({
          po_number: {
            [Op.like]: `%${search_PO}%`,
          },
        });
      }
      if (supplier_id) {
        whereOfferClause[Op.and].push({
          supplier_id,
        });
      }
      getAllPONumber = await db.OFFERS.findAndCountAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("po_number")), "po_number"],
        ],
        where: whereOfferClause,
        limit: parseInt(page_size),
        offset: (parseInt(page_number) - 1) * parseInt(page_size),
        order: [["po_number", "ASC"]],
      });

      for (let key in getAllPONumber.rows) {
        const getSupplierNameEveryPO = await db.OFFERS.findOne({
          attributes: [],
          include: [
            {
              model: db.SUPPLIERS,
              as: "supplier",
              attributes: ["name"],
            },
          ],
          where: {
            po_number: getAllPONumber.rows[key].po_number,
            deleted_at: null,
          },
        });
        getAllPONumber.rows[key].dataValues.supplier_name =
          getSupplierNameEveryPO?.supplier?.name;
        const countSKUInOnePO = await db.OFFERS.findAndCountAll({
          attributes: [
            [Sequelize.fn("DISTINCT", Sequelize.col("sku_code")), "sku_code"],
            "sku_code",
          ],
          where: {
            po_number: getAllPONumber.rows[key].po_number,
            deleted_at: null,
          },
          group: ["sku_code", "sku_name"],
        });
        getAllPONumber.rows[key].dataValues.sku_count =
          countSKUInOnePO.count.length;

        getAllPONumber.count = countSKUInOnePO.count.length;

        const countTotalSchedule = await db.OFFERS.findAndCountAll({
          attributes: [[Sequelize.fn("COUNT", "po_number"), "total_schedule"]],
          where: {
            po_number: getAllPONumber.rows[key].po_number,
            deleted_at: null,
            edit_from_id: null,
            split_from_id: null,
          },
        });

        getAllPONumber.rows[key].dataValues.total_schedule =
          countTotalSchedule.count;

        const countCompleteSchedule = await db.OFFERS.findAndCountAll({
          attributes: [
            [Sequelize.fn("COUNT", "po_number"), "complete_schedule"],
          ],
          where: {
            po_number: getAllPONumber.rows[key].po_number,
            deleted_at: null,
            edit_from_id: null,
            split_from_id: null,
            flag_status: "X",
          },
        });
        getAllPONumber.rows[key].dataValues.complete_schedule =
          countCompleteSchedule.count;
      }

      const { dataFilter, countFilter } = filterDoubleFindCount(getAllPONumber);

      return successResponse(req, res, {
        transactions: dataFilter,
        total: countFilter,
      });
    }
    if (po_number) {
      const whereOfferClause = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                po_number: {
                  [Sequelize.Op.not]: null,
                  [Sequelize.Op.not]: "",
                },
              },
            ],
          },
          { deleted_at: null },
        ],
      };
      whereOfferClause[Op.and].push({
        po_number: po_number,
      });
      if (sku_code) {
        whereOfferClause[Op.and].push({
          sku_code: sku_code,
        });
        getAllPONumber = await db.OFFERS.findAll({
          include: [
            {
              model: db.SUPPLIERS,
              as: "supplier",
              attributes: ["name"],
            },
          ],
          where: whereOfferClause,
        });

        const uniqueData = filterDoubleFind(getAllPONumber);

        return successResponse(req, res, {
          transactions: uniqueData,
        });
      } else {
        getAllPONumber = await db.OFFERS.findAll({
          attributes: [
            "sku_name",
            "sku_code",
            [Sequelize.fn("COUNT", "id"), "offer_count"], // Count the number of offers for each sku_code
          ],
          where: whereOfferClause,
          group: ["sku_code", "sku_name"],
        });
        return successResponse(req, res, {
          transactions: getAllPONumber,
        });
      }
    }
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransactionPOGet = async (req, res) => {
  const { po_number } = req.params;
  try {
    const whereOfferClause = {
      [Op.and]: [
        {
          [Op.or]: [
            {
              po_number: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.not]: "",
              },
            },
          ],
        },
        { deleted_at: null },
      ],
    };
    whereOfferClause[Op.and].push({
      po_number: po_number,
    });
    const getAllPONumber = await db.OFFERS.findAll({
      where: whereOfferClause,
    });

    return successResponse(req, res, {
      transactions: getAllPONumber,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const TransactionGet = async (req, res) => {};

export const TransactionDelivered = async (req, res) => {};

const filterDuplicateObjects = (arr) => {
  const uniqueObjects = [];
  const seenObjects = new Set();

  for (const obj of arr) {
    // Convert the object to a string for easy comparison
    const objString = JSON.stringify(obj);

    if (!seenObjects.has(objString)) {
      seenObjects.add(objString);
      uniqueObjects.push(obj);
    }
  }

  return uniqueObjects;
};
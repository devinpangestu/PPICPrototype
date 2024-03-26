import db from "../models/index.js";
import {
  successResponse,
  errorResponse,
  errorResponseUnauthorized,
  uniqueId,
} from "../helpers/index.js";
import { Op, Sequelize, literal, QueryTypes } from "sequelize";
import { getUserID, getUserName } from "../utils/auth.js";
import {
  parsingDateToString,
  parsingStringToDateEarly,
  parsingStringToDateLate,
} from "../utils/parsing.js";
import { getOutsQtyEachPOSKU } from "../utils/checker.js";
import {
  filterDeletedDoubleFindCount,
  filterDoubleFindCount,
} from "../utils/filter.js";
import moment from "moment";
import { constant } from "../constant/index.js";
import sendEmailNotificationPPICProc from "../utils/emailTemplate/sendEmailNotificationPPICProc.js";
import { PPICProcSentences } from "../utils/emailTemplate/sentences/PPICProcSentences.js";
import sendEmailNotificationProcSupplier from "../utils/emailTemplate/sendEmailNotificationProcSupplier.js";

export const PPICScheduleSummary = async (req, res) => {
  try {
    const {
      from_date,
      to_date,
      user_id,
      supplier_id,
      io_filter,
      category_filter,
      search_PO,
      status,
    } = req.query;
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const whereClause = {
      [Op.and]: [
        { deleted_at: null },
        { flag_status: ["A", "B", "C", "D", "E", "F", "G", "X"] },
        { is_edit: false },
        { is_split: false },
      ],
    };
    const whereClauseDeleted = {
      [Op.and]: [
        {
          deleted_at: { [Op.not]: null },
        },
        {
          submission_date: {
            [Op.between]: [
              parsingStringToDateEarly(from_date),
              parsingStringToDateLate(to_date),
            ],
          },
        },
      ],
    };

    if (user_id) {
      whereClauseDeleted[Op.and].push({ created_by_id: user_id });
      whereClause[Op.and].push({ created_by_id: user_id });
    }
    if (io_filter) {
      whereClauseDeleted[Op.and].push({ io_filter });
      whereClause[Op.and].push({ io_filter });
    }
    if (category_filter) {
      whereClauseDeleted[Op.and].push({ category_filter });
      whereClause[Op.and].push({ category_filter });
    }

    if (supplier_id) {
      whereClauseDeleted[Op.and].push({ supplier_id: supplier_id });
      whereClause[Op.and].push({ supplier_id: supplier_id });
    }
    if (search_PO) {
      whereClauseDeleted[Op.and].push({
        po_number: { [Op.like]: `%${search_PO}%` },
      });
      whereClause[Op.and].push({ po_number: { [Op.like]: `%${search_PO}%` } });
    }
    if (from_date && to_date) {
      whereClause[Op.and].push({
        submission_date: {
          [Op.between]: [
            parsingStringToDateEarly(from_date),
            parsingStringToDateLate(to_date),
          ],
        },
      });
    }

    const offers = await db.OFFERS.findAll({
      attributes: [
        "flag_status",
        [Sequelize.fn("count", Sequelize.col("flag_status")), "count"],
      ],
      where: whereClause,
      //created_by_id: userId, //TODO: change to user id
      group: ["flag_status"],
    });

    let summary = {};

    for (let prop in offers) {
      summary[offers[prop].dataValues.flag_status] =
        offers[prop].dataValues.count;
    }

    // Count all records with deleted_at not null
    const deletedCount = await db.OFFERS.count({
      where: whereClauseDeleted,
    });
    if (deletedCount > 0) {
      summary.deleted = deletedCount;
    }

    return successResponse(req, res, summary);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleList = async (req, res) => {
  const {
    from_date,
    to_date,
    status,
    supplier_id,
    io_filter,
    category_filter,
    user_id,
    searchPO,
  } = req.query;
  try {
    const customOrder = (column, values, direction) => {
      let orderByClause = "CASE ";
      for (let index = 0; index < values.length; index++) {
        let value = values[index];
        if (typeof value === "string") value = `'${value}'`;
        orderByClause += `WHEN ${column} = ${value} THEN '${index}' `;
      }
      orderByClause += `ELSE ${column} END`;
      return [literal(orderByClause), direction];
    };
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }

    const whereClause = {
      [Op.and]: [{ is_edit: false }, { is_split: false }],
    };
    if (status) {
      if (status === "deleted") {
        whereClause[Op.and].push({ [Op.not]: [{ deleted_at: null }] });
      } else {
        whereClause[Op.and].push({ flag_status: status });
      }
    }

    if (from_date && to_date) {
      whereClause[Op.and].push({
        submission_date: {
          [Op.between]: [
            parsingStringToDateEarly(from_date),
            parsingStringToDateLate(to_date),
          ],
        },
      });
    }
    if (supplier_id) {
      whereClause[Op.and].push({ supplier_id: supplier_id });
    }
    if (io_filter) {
      whereClause[Op.and].push({ io_filter });
    }
    if (category_filter) {
      whereClause[Op.and].push({ category_filter });
    }
    if (user_id) {
      whereClause[Op.and].push({ created_by_id: user_id });
    }
    if (searchPO) {
      whereClause[Op.and].push({ po_number: { [Op.like]: `%${searchPO}%` } });
    }
    const data = await db.OFFERS.findAndCountAll({
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "buyer",
          attributes: ["id", "name", "email", "oracle_username"],
        },
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "user_supplier",
          attributes: ["supplier_id", "name", "email"],
        },
      ],
      where: whereClause,
      order: [
        customOrder(
          "flag_status",
          ["A", "C", "B", "D", "E", "F", "G", "X"],
          "ASC"
        ),
        ["po_number", "ASC"],
        ["sku_code", "ASC"],
        ["est_delivery", "ASC"],
      ],
    });
    const { dataFilter, countFilter } =
      status !== "deleted"
        ? filterDoubleFindCount(data)
        : filterDeletedDoubleFindCount(data);

    return successResponse(req, res, {
      offer: dataFilter,
      total: countFilter,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleNeedActionMinDate = async (req, res) => {
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
        flag_status: ["A", "B", "C", "D", "E", "F", "G"],
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
export const PPICScheduleCreate = async (req, res) => {
  let dbTransaction = await db.sequelize.transaction();
  try {
    const {
      submission_date,
      supplier_name,
      line_num,
      po_number,
      io_filter,
      category_filter,
      po_qty,
      po_outs,
      sku_code,
      sku_name,
      qty_delivery,
      est_delivery,
      notes_ppic,
      auto_fill,
      hutang_kirim,
      mass,
      buyer_name,
    } = req.body.rq_body;

    const isMass = req.query.mass;
    const userId = getUserID(req);
    const userName = getUserName(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    //check if id ship is exist
    //TODO AUTOFILL DONE
    //TODO MASS DONE
    //TODO MANUAL
    if (isMass) {
      let offerToInsert = [];
      for (let key in mass) {
        let rowToInsert = mass[key];
        //check id for supplier

        const supplier = await db.SUPPLIERS.findOne({
          where: { name: rowToInsert.supplier_name },
        });
        if (!supplier) {
          return errorResponse(
            req,
            res,
            "Nama supplier tidak ditemukan, mohon cek kembali"
          );
        }
        const payloadToCheck = {
          [Op.and]: {
            submission_date: {
              [Op.between]: [
                parsingStringToDateEarly(rowToInsert.submission_date),
                parsingStringToDateLate(rowToInsert.submission_date),
              ],
            },
            io_filter: rowToInsert?.io_filter,
            category_filter: rowToInsert?.category_filter,
            supplier_id: supplier.ref_id, //dicari dulu id nya sesuai
            po_number: rowToInsert.po_number,
            po_qty: parseFloat(rowToInsert.po_qty),
            po_outs: parseFloat(rowToInsert.po_outs),
            sku_code: rowToInsert.sku_code,
            sku_name: rowToInsert.sku_name,
            qty_delivery: parseFloat(rowToInsert.qty_delivery),
            est_delivery: {
              [Op.between]: [
                parsingStringToDateEarly(rowToInsert.est_delivery),
                parsingStringToDateLate(rowToInsert.est_delivery),
              ],
            },
            created_by_id: userId,
            deleted_at: null,
          },
        };

        const checkIfDataExist = await db.OFFERS.findOne({
          where: payloadToCheck,
        });
        if (checkIfDataExist) {
          // const sumQtyDelivery = checkIfDataExist.reduce((total, obj) => {
          //   return total + Number(obj.qty_delivery);
          // }, 0);

          // if (sumQtyDelivery + qty_delivery > rowToInsert.po_outs) {
          //   continue;
          // }
          // if (sumQtyDelivery >= rowToInsert.po_outs) {
          //   continue;
          // }
          continue;
        }
        if (rowToInsert.po_outs > rowToInsert.po_qty) {
          return errorResponse(
            req,
            res,
            `Outstanding quantity tidak bisa lebih besar dari quantity PO untuk PO ${rowToInsert.po_number} dan barang ${rowToInsert.sku_name}, mohon cek kembali`
          );
        }
        if (rowToInsert.po_number === "") {
          continue;
        } else if (rowToInsert.po_number.substring(0, 2) === "PR") {
          const [err, result] = await OpenQueryPOOutsNoPR(
            rowToInsert.po_number,
            rowToInsert.sku_code,
            dbTransaction
          );
          if (!err) {
            return errorResponse(req, res, "Gagal mencari data PR");
          }
          if (rowToInsert.po_outs > result[0].QUANTITY_OUTSTANDING) {
            return errorResponse(
              req,
              res,
              `Outstanding quantity tidak cocok dengan data outstanding quantity Oracle untuk PR ${rowToInsert.po_number} dan barang ${rowToInsert.sku_name}, mohon cek kembali`
            );
          }
        } else {
          const [err, result] = await OpenQueryPOOutsNoPO(
            rowToInsert.po_number,
            rowToInsert.sku_code,
            dbTransaction
          );
          if (!err) {
            return errorResponse(req, res, "Gagal mencari data PO Outstanding");
          }

          if (rowToInsert.po_outs !== result[0].QUANTITY_OUTSTANDING) {
            return errorResponse(
              req,
              res,
              `Outstanding quantity tidak cocok dengan data outstanding quantity Oracle untuk PO ${rowToInsert.po_number} dan barang ${rowToInsert.sku_name}, mohon cek kembali`
            );
          }
        }

        const [err, resultLine] = await OpenQueryGetLineNum(
          rowToInsert.po_number,
          rowToInsert.sku_code
        );
        if (!err) {
          return errorResponse(req, res, "Gagal mendapatkan data line number");
        }
        console.log(resultLine);
        if (resultLine.length === 0) {
          return errorResponse(
            req,
            res,
            `Data PO ${rowToInsert.po_number} dan barang ${rowToInsert.sku_name} tidak ditemukan`
          );
        }
        //search buyer id
        console.log(436);
        if (rowToInsert.qty_delivery > rowToInsert.po_outs) {
          continue;
          // return errorResponse(
          //   req,
          //   res,
          //   `Jumlah quantity pengiriman melebihi quantity outstanding, mohon cek kembali`
          // );
        }
        console.log(445);
        const getBuyerId = await db.USERS.findOne({
          attributes: ["id"],
          raw: true,
          where: { oracle_username: resultLine[0].BUYER_NAME },
        });
        if (!getBuyerId) {
          return errorResponse(
            req,
            res,
            `Buyer tidak terdaftar dalam sistem, mohon cek kembali`
          );
        }
        console.log(458);
        const payloadToInsert = {
          submission_date: moment(rowToInsert.submission_date).format(
            constant.FORMAT_DATE_API
          ),
          io_filter: rowToInsert.io_filter.toLowerCase(),
          category_filter: rowToInsert.category_filter.toLowerCase(),
          supplier_id: supplier.ref_id, //dicari dulu id nya sesuai
          po_number: rowToInsert.po_number,
          po_qty: parseFloat(rowToInsert.po_qty),
          po_outs: parseFloat(rowToInsert.po_outs),
          sku_code: rowToInsert.sku_code,
          sku_name: rowToInsert.sku_name,
          qty_delivery: parseFloat(rowToInsert.qty_delivery),
          est_delivery: rowToInsert.est_delivery,
          history: JSON.stringify([
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Inserted Data by mass import by ${userName}`,
              created_at: new Date(),
              created_by: userName,
            },
          ]),
          buyer_id: getBuyerId.id,
          created_by_id: userId,
          updated_by_id: userId,
          created_at: moment().format(constant.FORMAT_DATE_API),
          updated_at: moment().format(constant.FORMAT_DATE_API),
          line_num: resultLine[0].LINE_NUMBER,
          notes: JSON.stringify({
            init: {
              notes: rowToInsert.notes_ppic,
              created_by: userName,
              created_at: new Date(),
            },
          }),
        };

        console.log(494);
        //check if data that want to inserted is not more than po outs if data with po and sku code is exist by reduce and add the qty delivery
        const checkIfPOSKUExist = offerToInsert.filter(
          (x) =>
            x.po_number === payloadToInsert.po_number &&
            x.sku_code === payloadToInsert.sku_code
        );

        if (checkIfPOSKUExist.length === 0) {
          const anotherPOSKUInDB = await db.OFFERS.findAll({
            where: {
              po_number: payloadToInsert.po_number,
              sku_code: payloadToInsert.sku_code,
            },
            raw: true,
          });
          const sumQtyDelivery = anotherPOSKUInDB.reduce((total, obj) => {
            return total + Number(obj.qty_delivery);
          }, 0);
          if (
            sumQtyDelivery + payloadToInsert.qty_delivery >
            rowToInsert.po_outs
          ) {
            continue;
          }

          offerToInsert.push(payloadToInsert);
        }
        if (checkIfPOSKUExist.length > 0) {
          const sumQtyDelivery = checkIfPOSKUExist.reduce((total, obj) => {
            return total + Number(obj.qty_delivery);
          }, 0);
          if (
            sumQtyDelivery + payloadToInsert.qty_delivery >
            rowToInsert.po_outs
          ) {
            continue;
            // return errorResponse(
            //   req,
            //   res,
            //   "Jumlah quantity pengiriman melebihi outstanding quantity, mohon cek jadwal yang telah terdaftar"
            // );
          }

          if (
            sumQtyDelivery + payloadToInsert.qty_delivery <=
            rowToInsert.po_outs
          ) {
            offerToInsert.push(payloadToInsert);
            // return errorResponse(
            //   req,
            //   res,
            //   "Jumlah quantity pengiriman melebihi outstanding quantity, mohon cek kembali"
            // );
          }
        }

        // await db.OFFERS.create(payloadToInsert, { transaction: dbTransaction });
      }
      await db.OFFERS.bulkCreate(offerToInsert).then(() =>
        console.log("DATA IMPORTED SUCCESSFULLY BRO")
      );
      await dbTransaction.commit();
      return successResponse(req, res, "Success Import Data Jadwal Pengiriman");
    } else {
      //check if name is exist

      let supplier;
      if (po_number.substring(0, 2) === "PO") {
        supplier = await db.SUPPLIERS.findOne({
          where: { name: supplier_name },
        });
        if (!supplier) {
          return errorResponse(
            req,
            res,
            "Nama supplier tidak ditemukan, mohon refresh data supplier kembali"
          );
        }
        const checkIfDataExist = await db.OFFERS.findAll({
          where: {
            po_number,
            sku_code,
            deleted_at: null,
          },
          raw: true,
        });
        console.log(checkIfDataExist);
        if (checkIfDataExist) {
          const sumQtyDelivery = checkIfDataExist.reduce((total, obj) => {
            return total + Number(obj.qty_delivery);
          }, 0);

          if (sumQtyDelivery + qty_delivery > po_outs) {
            return errorResponse(
              req,
              res,
              "Total quantity pengiriman melebihi outstanding quantity, mohon cek jadwal yang telah terdaftar dalam sistem"
            );
          }
          // if (sumQtyDelivery >= po_outs) {
          //   return errorResponse(
          //     req,
          //     res,
          //     "Jumlah quantity pengiriman melebihi outstanding quantity, mohon cek kembali"
          //   );
          // }
        }

        if (po_outs > po_qty) {
          return errorResponse(
            req,
            res,
            `Outstanding quantity tidak bisa lebih besar dari quantity PO, mohon cek kembali`
          );
        }
      }

      //CHECK IF PURCHASE ORDER OR PURCHASE REQUISITION TYPE (PO/PR)
      let err;
      let result;
      if (po_number === "") {
      } else if (po_number.substring(0, 2) === "PR") {
        [err, result] = await OpenQueryPOOutsNoPR(
          po_number,
          line_num,
          dbTransaction
        );
      } else {
        [err, result] = await OpenQueryPOOutsNoPO(
          po_number,
          sku_code,
          dbTransaction
        );
      }

      if (!err) {
        return errorResponse(req, res, "Gagal mencari data PO Outstanding");
      }
      if (po_outs > result[0].QUANTITY_OUTSTANDING) {
        return errorResponse(
          req,
          res,
          `Outstanding quantity tidak cocok dengan data outstanding quantity Oracle untuk PO ${po_number} dan barang ${sku_name}, mohon cek kembali`
        );
      }

      if (qty_delivery > po_outs) {
        return errorResponse(
          req,
          res,
          `Jumlah quantity pengiriman melebihi quantity outstanding, mohon cek kembali`
        );
      }

      const getBuyerId = await db.USERS.findOne({
        attributes: ["id"],
        where: { oracle_username: buyer_name },
      });
      if (!getBuyerId) {
        return errorResponse(
          req,
          res,
          `Buyer tidak terdaftar dalam sistem, mohon cek kembali`
        );
      }
      console.log(650);
      await db.OFFERS.create(
        {
          submission_date,
          category_filter,
          io_filter,
          supplier_id: supplier?.ref_id ?? null, //dicari dulu id nya sesuai
          po_number,
          po_qty,
          po_outs,
          sku_code,
          sku_name,
          hutang_kirim,
          qty_delivery,
          est_delivery,
          history: JSON.stringify([
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Inserted Data by Manual Input by ${userName}`,
              created_at: new Date(),
              created_by: userName,
            },
          ]),
          notes: JSON.stringify({
            init: {
              notes: notes_ppic,
              created_by: userName,
              created_at: new Date(),
            },
          }),
          created_by_id: userId,
          updated_by_id: userId,
          buyer_id: getBuyerId.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();
      return successResponse(req, res, "Success Insert Data Jadwal Pengiriman");
    }
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleSplitPPIC = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const offer_id = req.params.id;
    const { schedules } = req.body.rq_body;

    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const offerToSplitted = await db.OFFERS.findOne({
      where: { id: offer_id },
      attributes: {
        exclude: ["id"],
      },
    });

    const totalQuantitySplitted = schedules.reduce((total, obj) => {
      return total + Number(obj.qty_delivery);
    }, 0);

    if (
      parseInt(totalQuantitySplitted) != parseInt(offerToSplitted.qty_delivery)
    ) {
      return errorResponse(
        req,
        res,
        "Jumlah quantity yang di split melebihi quantity yang ada di jadwal pengiriman, silahkan cek kembali"
      );
    }

    const { qty_delivery, est_delivery, ...propsToCopy } = offerToSplitted;

    for (let key in schedules) {
      const payloadForSplittedSchedule = {
        ...offerToSplitted.dataValues,
        est_delivery: new Date(schedules[key].est_delivery),
        qty_delivery: schedules[key].qty_delivery,
      };
      await db.OFFERS.create(payloadForSplittedSchedule, {
        transaction: dbTransaction,
      });
    }

    // Delete the original entry
    await db.OFFERS.destroy(
      {
        where: { id: offer_id },
      },
      { transaction: dbTransaction }
    );
    // Commit the transaction
    await dbTransaction.commit();

    return successResponse(req, res, "Schedule splitted");
  } catch (error) {
    await dbTransaction.rollback();

    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleGet = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const data = await db.OFFERS.findOne({
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "buyer",
          attributes: ["id", "name", "email", "oracle_username"],
        },
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "user_supplier",
          attributes: ["supplier_id", "name", "email"],
        },
      ],
      where: { id },
    });
    return successResponse(req, res, data);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleGetPODetails = async (req, res) => {
  try {
    const { po_number, line_num } = req.query;

    const userId = getUserID(req);
    console.log(po_number.substring(0, 2) === "PR");
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    let err;
    let result;
    if (po_number.substring(0, 2) === "PR") {
      console.log("masuksini");
      [err, result] = await OpenQueryPOOutsNoPR(po_number, Number(line_num));
      console.log(result);
    } else {
      [err, result] = await OpenQueryPODetails(po_number, Number(line_num));
    }

    if (!err) {
      return errorResponse(req, res, "Gagal refresh data PO/PR Outs");
    }
    if (result.length === 0) {
      return errorResponse(req, res, "Data PO/PR tidak ditemukan");
    }
    return successResponse(req, res, result[0]);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleGetInputPODetails = async (req, res) => {
  try {
    const dbTransaction = await db.sequelize.transaction();
    const { po_number } = req.query;
    console.log(po_number);
    const userId = getUserID(req);
    const userName = getUserName(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    let err;
    let result;
    console.log("masih jalan");
    [err, result] = await OpenQueryPODetailsPOOnly(po_number);
    console.log(result);
    if (!err) {
      return errorResponse(req, res, "Gagal refresh data PO/PR Outs");
    }
    if (result.length === 0) {
      return errorResponse(req, res, "Data PO/PR tidak ditemukan");
    }
    return successResponse(req, res, result);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleGetInputPRDetails = async (req, res) => {
  try {
    const { pr_number } = req.query;

    const userId = getUserID(req);
    const userName = getUserName(req);
    console.log(pr_number.substring(0, 2) === "PR");
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    let err;
    let result;

    [err, result] = await OpenQueryPRDetailsPROnly(pr_number);

    if (!err) {
      return errorResponse(req, res, "Gagal refresh data PO/PR Outs");
    }
    if (result.length === 0) {
      return errorResponse(req, res, "Data PO/PR tidak ditemukan");
    }
    return successResponse(req, res, result);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleEdit = async (req, res) => {
  try {
    const { schedules } = req.body.rq_body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    if (schedules?.is_edit) {
      const {
        id,
        submission_date,
        supplier_name,
        po_number,
        po_qty,
        po_outs,
        sku_code,
        sku_name,
        qty_delivery,
        est_delivery,
        supplier,
        io_filter,
        category_filter,
        notes,
      } = schedules;
      if (
        po_number.substring(0, 2) === "PO" ||
        po_number.substring(0, 2) === "PI"
      ) {
        const [err, resultLine] = await OpenQueryGetLineNum(
          po_number,
          sku_code
        );
        if (!err) {
          return errorResponse(req, res, "Gagal mendapatkan data line number");
        }
        if (resultLine.length === 0) {
          return errorResponse(
            req,
            res,
            `Data PO ${po_number} dan barang ${sku_name} tidak ditemukan`
          );
        }

        let getSupplierId;
        if (!supplier) {
          //get supplier id
          getSupplierId = await db.SUPPLIERS.findOne({
            attributes: ["ref_id"],
            where: { name: resultLine[0].VENDOR_NAME },
            raw: true,
          });
        } else {
          getSupplierId = await db.SUPPLIERS.findOne({
            attributes: ["ref_id"],
            where: { name: resultLine[0].VENDOR_NAME },
            raw: true,
          });
        }

        const getBuyerId = await db.USERS.findOne({
          attributes: ["id"],
          raw: true,
          where: { oracle_username: resultLine[0].BUYER_NAME },
        });

        if (!getBuyerId) {
          return errorResponse(
            req,
            res,
            `Buyer tidak terdaftar dalam sistem, mohon cek kembali`
          );
        }
        console.log(1085);
        const getExistingHistory = await db.OFFERS.findOne({
          where: { id },
          include: [
            {
              model: db.SUPPLIERS,
              as: "supplier",
              attributes: ["id", "ref_id", "name", "email"],
              
            },
          ],
          
        });
        const history = JSON.parse(getExistingHistory?.history);
        const getNotes = JSON.parse(getExistingHistory?.notes);
        console.log({
          history: JSON.stringify([
            ...(history || []),
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Schedule <b>Force Edited</b> by ${userName},
              changes :
              Supplier : ${
                supplier
                  ? ` ${supplier.name} -> ${resultLine[0].VENDOR_NAME} `
                  : ""
              }
              - Updating PO Number : ${getExistingHistory?.po_number} -> ${
                resultLine[0].PO_NUMBER
              }
              - Updating PO Quantity : ${po_qty} -> ${resultLine[0].QUANTITY}
              - Updating PO Outs : ${po_outs} -> ${resultLine[0].QTY_OUTS}
              By ${userName} `,
              created_at: new Date(),
              created_by: userName,
            },
          ]),
        });
        console.log(getExistingHistory);
        const changesSentences = `
${
  getExistingHistory?.supplier?.name === resultLine[0].VENDOR_NAME
    ? ""
    : `- Updating Supplier : ${
        supplier
          ? ` ${getExistingHistory?.supplier?.name ?? ""} -> ${
              resultLine[0].VENDOR_NAME
            } `
          : ""
      }`
}
${
  getExistingHistory?.po_number === resultLine[0].PO_NUMBER
    ? ""
    : `- Updating PO Number : ${getExistingHistory?.po_number} -> ${resultLine[0].PO_NUMBER}`
}
${
  getExistingHistory?.po_qty === resultLine[0].QUANTITY
    ? ""
    : `- Updating PO Quantity : ${getExistingHistory?.po_qty} -> ${resultLine[0].QUANTITY}`
}
${
  getExistingHistory?.po_outs === resultLine[0].QTY_OUTS
    ? ""
    : `- Updating PO Outs : ${getExistingHistory?.po_outs} -> ${resultLine[0].QTY_OUTS}`
}
${
  moment(getExistingHistory?.est_delivery).format(constant.FORMAT_DATE_API) ===
  est_delivery
    ? ""
    : `- Updating PO Delivery Date : ${moment(
        getExistingHistory?.est_delivery
      ).format(constant.FORMAT_DATE_API)} -> ${est_delivery}`
}
${
  getExistingHistory?.qty_delivery === qty_delivery
    ? ""
    : `- Updating PO Delivery Quantity : ${getExistingHistory?.qty_delivery} -> ${qty_delivery}`
}
By ${userName} and reset the status to schedule initialization`;

        await db.OFFERS.update(
          {
            submission_date,
            supplier_id: getSupplierId?.ref_id, //dicari dulu id nya sesuai
            po_number,
            po_qty: Number(resultLine[0].QUANTITY),
            sku_code,
            sku_name,
            line_num: Number(resultLine[0].LINE_NUMBER),
            po_outs: parseFloat(resultLine[0].QTY_OUTS),
            qty_delivery: Number(qty_delivery),
            est_delivery: new Date(est_delivery),
            updated_by_id: userId,
            updated_at: new Date(),
            buyer_id: getBuyerId.id,
            history: JSON.stringify([
              ...(history || []),
              {
                detail: `${moment().format(
                  constant.FORMAT_DISPLAY_DATETIME
                )} Schedule Force Edited by ${userName},
                changes :
                ${changesSentences}`,
                created_at: new Date(),
                created_by: userName,
              },
            ]),
            notes: JSON.stringify({
              ...getNotes,
              init: {
                notes: notes,
                created_at: new Date(),
                created_by: userName,
              },
            }),
            send_supplier_date: null,
            supplier_confirm_date: null,
            submitted_qty: null,
            est_submitted_date: null,
            flag_status: "A",
          },
          {
            where: { id },
          }
        );
      }
    } else {
      for (let key in schedules) {
        const {
          id,
          submission_date,
          supplier_name,
          po_number,
          po_qty,
          po_outs,
          sku_code,
          sku_name,
          qty_delivery,
          est_delivery,
          io_filter,
          category_filter,
          supplier,
        } = schedules[key];
        if (po_number.substring(0, 2) === "PR") {
          const getExistingHistory = await db.OFFERS.findOne({
            where: { id },
            attributes: ["history"],
          });
          const history = JSON.parse(getExistingHistory?.history);

          await db.OFFERS.update(
            {
              submission_date,
              supplier_id: supplier?.ref_id, //dicari dulu id nya sesuai
              po_number,
              po_qty,
              po_outs,
              sku_code,
              sku_name,
              qty_delivery,
              est_delivery,
              io_filter,
              category_filter,
              history: JSON.stringify([
                ...(history || []),
                {
                  detail: `${moment().format(
                    constant.FORMAT_DISPLAY_DATETIME
                  )} Schedule Edited by ${userName}`,
                  created_at: new Date(),
                  created_by: userId,
                },
              ]),
              updated_by_id: userId,
              updated_at: new Date(),
            },
            {
              where: { id },
            }
          );
        } else if (
          po_number.substring(0, 2) === "PO" ||
          po_number.substring(0, 2) === "PI"
        ) {
          const [err, resultLine] = await OpenQueryGetLineNum(
            po_number,
            sku_code
          );
          if (!err) {
            return errorResponse(
              req,
              res,
              "Gagal mendapatkan data line number"
            );
          }
          if (resultLine.length === 0) {
            return errorResponse(
              req,
              res,
              `Data PO ${po_number} dan barang ${sku_name} tidak ditemukan`
            );
          }

          let getSupplierId;
          if (!supplier) {
            //get supplier id
            getSupplierId = await db.SUPPLIERS.findOne({
              attributes: ["ref_id"],
              where: { name: resultLine[0].VENDOR_NAME },
              raw: true,
            });
          } else {
            getSupplierId = await db.SUPPLIERS.findOne({
              attributes: ["ref_id"],
              where: { name: resultLine[0].VENDOR_NAME },
              raw: true,
            });
          }
          // else {
          //   //checking if supplier same with oracle
          //   if (supplier.name !== resultLine[0].VENDOR_NAME) {
          //     return errorResponse(
          //       req,
          //       res,
          //       `Supplier tidak sesuai dengan data Oracle, apabila terjadi kesalahan penginputan supplier silahkan retur ke PPIC`
          //     );
          //   }
          // }

          const getBuyerId = await db.USERS.findOne({
            attributes: ["id"],
            raw: true,
            where: { oracle_username: resultLine[0].BUYER_NAME },
          });

          if (!getBuyerId) {
            return errorResponse(
              req,
              res,
              `Buyer tidak terdaftar dalam sistem, mohon cek kembali`
            );
          }
          
          const getExistingHistory = await db.OFFERS.findOne({
            where: { id },
            raw: true,
          });
          
          const history = JSON.parse(getExistingHistory?.history);

          await db.OFFERS.update(
            {
              submission_date,
              supplier_id: getSupplierId?.ref_id, //dicari dulu id nya sesuai
              po_number,
              po_qty: Number(resultLine[0].QUANTITY),
              sku_code,
              sku_name,
              line_num: Number(resultLine[0].LINE_NUMBER),
              po_outs: parseFloat(resultLine[0].QTY_OUTS),
              qty_delivery: Number(qty_delivery),
              est_delivery: new Date(est_delivery),
              updated_by_id: userId,
              updated_at: new Date(),
              buyer_id: getBuyerId.id,
              history: JSON.stringify([
                ...(history || []),
                {
                  detail: `${moment().format(
                    constant.FORMAT_DISPLAY_DATETIME
                  )} Schedule Edited by ${userName},
                  changes :
                  Supplier : ${
                    supplier
                      ? ` ${supplier.name} -> ${resultLine[0].VENDOR_NAME} `
                      : ""
                  }
                  - Updating PO Number : ${getExistingHistory?.po_number} -> ${
                    resultLine[0].PO_NUMBER
                  }
                  - Updating PO Quantity : ${po_qty} -> ${
                    resultLine[0].QUANTITY
                  }
                  - Updating PO Outs : ${po_outs} -> ${resultLine[0].QTY_OUTS}
                  By ${userName} `,
                  created_at: new Date(),
                  created_by: userName,
                },
              ]),
            },
            {
              where: { id },
            }
          );
        }
      }
    }

    return successResponse(req, res, "Success Insert Data Jadwal Pengiriman");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleRefreshPOOuts = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { from_date, to_date } = req.query;
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const whereClause = {
      submission_date: {
        [Op.between]: [
          parsingStringToDateEarly(from_date),
          parsingStringToDateLate(to_date),
        ],
      },
      deleted_at: null,
    };
    const offers = await db.OFFERS.findAll({
      where: whereClause,
      attributes: ["po_number", "sku_code"],
      raw: true, // Ensure that the result is in plain JSON objects
      group: ["po_number", "sku_code"],
    });

    for (let key in offers) {
      const po_number = offers[key].po_number;
      const sku_code = offers[key].sku_code;

      if (po_number === "") {
        continue;
      } else {
        const [err, res] = await OpenQueryGetLineNum(po_number, sku_code);

        if (!err) {
          return errorResponse(req, res, "Gagal refresh data PO Outs");
        }

        const qtyOuts = res[0].QTY_OUTS;
        console.log(res[0]);
        if (qtyOuts == null) {
          continue;
        } else {
          await db.OFFERS.update(
            { po_outs: qtyOuts },
            {
              where: {
                po_number,
                sku_code,
              },
            },
            { transaction: dbTransaction }
          );
        }
      }
    }

    await dbTransaction.commit();
    return successResponse(req, res, "Success Refresh Data PO Outs");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleDelete = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const id = req.params.id;
    const userId = getUserID(req);
    const checkId = await db.OFFERS.findOne({
      where: {
        id,
      },
    });
    if (!checkId) {
      return errorResponse(
        req,
        res,
        "Data dengan id tersebut tidak ditemukan atau sudah dihapus"
      );
    }
    const payloadDeletedAt = { deleted_at: new Date(), deleted_by_id: userId };
    await db.OFFERS.update(
      payloadDeletedAt,
      {
        where: { id },
      },
      { transaction: dbTransaction }
    );
    await dbTransaction.commit();
    return successResponse(req, res, "Delete Data Transportasi Success");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleSendToPurchasing = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { rq_body } = req.body;

    const userId = getUserID(req);
    const userName = getUserName(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    //check if id ship is exist
    let buyerEmail = [];
    for (let key in rq_body) {
      let rowToUpdate = rq_body[key];
      // check id for supplier
      const id = rowToUpdate.id;
      const getExistingHistory = await db.OFFERS.findOne({
        where: { id },
        attributes: ["history"],
      });
      const history = JSON.parse(getExistingHistory?.history);

      if (rowToUpdate.flag_status == "A") {
        await db.OFFERS.update(
          {
            flag_status: "B",
            updated_by_id: userId,
            updated_at: new Date(),
            history: JSON.stringify([
              ...(history || []),
              {
                detail: `${moment().format(
                  constant.FORMAT_DISPLAY_DATETIME
                )} Data Sent to Purchasing by ${userName}`,
                created_at: new Date(),
                created_by: userName,
              },
            ]),
          },
          {
            where: { id },
          },
          { transaction: dbTransaction }
        );
      } else if (rowToUpdate.flag_status == "C") {
        await db.OFFERS.update(
          {
            flag_status: "D",
            updated_by_id: userId,
            updated_at: new Date(),
            history: JSON.stringify([
              ...(history || []),
              {
                detail: `${moment().format(
                  constant.FORMAT_DISPLAY_DATETIME
                )} Data Sent After Retur to Purchasing by ${userName}`,
                created_at: new Date(),
                created_by: userName,
              },
            ]),
          },
          {
            where: { id },
          },
          { transaction: dbTransaction }
        );
      }

      buyerEmail.push(rowToUpdate.buyer?.email);
    }

    const sentencesText = PPICProcSentences(rq_body);

    await sendEmailNotificationPPICProc(
      "BKP - Jadwal Pengiriman Barang ke Procurement",
      `New Schedule has been submitted, please check to your account`,
      [...new Set(buyerEmail)]
    );

    await dbTransaction.commit();

    return successResponse(
      req,
      res,
      "Sukses Memberikan Jadwal Pengiriman kepada Procurement"
    );
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleAcceptSplitSupplier = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { id } = req.body.rq_body;

    const userId = getUserID(req);
    const userName = getUserName(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const checkTheCurrentID = await db.OFFERS.findOne({
      where: { id },
      include: [
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "user_supplier",
          attributes: ["supplier_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    const checkAnotherSplit = await db.OFFERS.findAll({
      where: {
        split_from_id: checkTheCurrentID.split_from_id,
        flag_status: "G",
      },
    });

    //update the status of splitted data
    for (let key in checkAnotherSplit) {
      await db.OFFERS.update(
        {
          qty_delivery: checkAnotherSplit[key].dataValues.submitted_qty,
          est_delivery: checkAnotherSplit[key].dataValues.est_submitted_date,
          history: JSON.stringify([
            ...(JSON.parse(checkAnotherSplit[key].dataValues.history) || []),
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Split Schedule Request Accepted by ${userName} and flagged as success`,
              created_at: new Date(),
              created_by: userName,
            },
          ]),
          flag_status: "X",
          split_from_id: null,
          supplier_confirm_date: new Date(),
          updated_by_id: userId,
          updated_at: new Date(),
        },
        {
          where: { id: checkAnotherSplit[key].id },
        },
        { transaction: dbTransaction }
      );
    }
    //delete the original data
    await db.OFFERS.destroy(
      {
        where: { id: checkTheCurrentID.split_from_id },
      },
      { transaction: dbTransaction }
    );
    await dbTransaction.commit();
    return successResponse(req, res, "Split Request Accepted");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleRejectSplitSupplier = async (req, res) => {
  try {
    const { id } = req.body.rq_body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    let supplierEmail = [];
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const checkTheCurrentID = await db.OFFERS.findOne({
      where: { id },
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "user_supplier",
          attributes: ["supplier_id", "name", "email"],
        },
      ],
    });
    const checkAnotherSplit = await db.OFFERS.findAll({
      where: {
        split_from_id: checkTheCurrentID.split_from_id,
        flag_status: "G",
      },
    });

    //restore the original data
    await db.OFFERS.update(
      {
        flag_status: "E",
        history: JSON.stringify([
          ...(JSON.parse(checkTheCurrentID.history) || []),
          {
            detail: `${moment().format(
              constant.FORMAT_DISPLAY_DATETIME
            )} Split Schedule Request Rejected by ${userName} and sent back to Supplier ${
              checkTheCurrentID?.supplier?.name
            }`,
            created_at: new Date(),
            created_by: userName,
          },
        ]),
        is_split: false,
        updated_by_id: userId,
        updated_at: new Date(),
      },
      {
        where: { id: checkTheCurrentID.split_from_id },
      }
    );
    supplierEmail.push(checkTheCurrentID?.user_supplier?.email);
    //delete the splitted data
    for (let key in checkAnotherSplit) {
      await db.OFFERS.destroy({
        where: { id: checkAnotherSplit[key].id },
      });
    }
    await sendEmailNotificationProcSupplier(
      "BKP - Schedule Split Request [Rejected]",
      `Split Request Rejected by PPIC ${userName}, please check to your account and resubmit the request if necessary`,
      [...new Set(supplierEmail)]
    );
    return successResponse(req, res, "Split Request Rejected");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleAcceptEditSupplier = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { id } = req.body.rq_body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const checkTheCurrentID = await db.OFFERS.findOne({
      where: { id },
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "user_supplier",
          attributes: ["supplier_id", "name", "email"],
        },
      ],
    });
    const checkAnotherEditedOffer = await db.OFFERS.findAll({
      where: {
        po_number: checkTheCurrentID.po_number,
        sku_code: checkTheCurrentID.sku_code,
        is_edit: false,
        flag_status: "G",
      },
    });
    //update the status of editted data
    for (let key in checkAnotherEditedOffer) {
      await db.OFFERS.update(
        {
          qty_delivery: checkAnotherEditedOffer[key].dataValues.submitted_qty,
          est_delivery:
            checkAnotherEditedOffer[key].dataValues.est_submitted_date,
          history: JSON.stringify([
            ...(JSON.parse(checkAnotherEditedOffer[key]?.dataValues.history) ||
              []),
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Edit Schedule Request Accepted by ${userName} and flagged as success`,
              created_at: new Date(),
              created_by: userName,
            },
          ]),
          edit_from_id: null,
          supplier_confirm_date: new Date(),
          flag_status: "X",
          updated_by_id: userId,
          updated_at: new Date(),
        },
        {
          where: { id: checkAnotherEditedOffer[key].id },
        },
        { transaction: dbTransaction }
      );
      //delete the original data
      await db.OFFERS.destroy(
        {
          where: { id: checkAnotherEditedOffer[key].dataValues.edit_from_id },
        },
        { transaction: dbTransaction }
      );
    }

    await dbTransaction.commit();
    return successResponse(req, res, "Split Request Rejected");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleRejectEditSupplier = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();

  try {
    const { id } = req.body.rq_body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    let supplierEmail = [];
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const checkTheCurrentID = await db.OFFERS.findOne({
      where: { id },
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "user_supplier",
          attributes: ["supplier_id", "name", "email"],
        },
      ],
    });
    const checkAnotherEditedOffer = await db.OFFERS.findAll({
      where: {
        po_number: checkTheCurrentID.po_number,
        sku_code: checkTheCurrentID.sku_code,
        [Op.not]: [{ edit_from_id: null }],
        flag_status: "G",
      },
    });

    for (let key in checkAnotherEditedOffer) {
      //restore the original data
      await db.OFFERS.update(
        {
          flag_status: "E",
          history: JSON.stringify([
            ...(JSON.parse(checkAnotherEditedOffer[key].dataValues.history) ||
              []),
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Edit Schedule Request Rejected by ${userName} and sent back to Supplier ${
                checkTheCurrentID?.supplier?.name
              }`,
              created_at: new Date(),
              created_by: userName,
            },
          ]),

          is_edit: false,
          updated_by_id: userId,
          updated_at: new Date(),
        },
        {
          where: {
            id: checkAnotherEditedOffer[key].dataValues.edit_from_id,
            is_edit: true,
          },
        },
        { transaction: dbTransaction }
      );
      //delete the Edited data
      await db.OFFERS.destroy(
        {
          where: { id: checkAnotherEditedOffer[key].dataValues.id },
        },
        { transaction: dbTransaction }
      );
      supplierEmail.push(checkAnotherEditedOffer[key].user_supplier?.email);
    }

    await sendEmailNotificationProcSupplier(
      "BKP - Schedule Edit Request [Rejected]",
      `Edit Request Rejected by PPIC ${userName}, please check to your account and resubmit the request if necessary`,
      [...new Set(supplierEmail)]
    );

    return successResponse(req, res, "Edit Request Rejected");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleAcceptClosePOSupplier = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { id } = req.body.rq_body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const checkTheCurrentID = await db.OFFERS.findOne({
      where: { id },
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "user_supplier",
          attributes: ["supplier_id", "name", "email"],
        },
      ],
    });

    //update the status of editted data

    await db.OFFERS.update(
      {
        flag_status: "X",
        history: JSON.stringify([
          ...(JSON.parse(checkTheCurrentID?.history) || []),
          {
            detail: `${moment().format(
              constant.FORMAT_DISPLAY_DATETIME
            )} Close PO Schedule Request Accepted by ${userName} and Marked as Completed`,
            created_at: new Date(),
            created_by: userName,
          },
        ]),
        updated_by_id: userId,
        updated_at: new Date(),
      },
      {
        where: { id },
      },
      { transaction: dbTransaction }
    );
    await dbTransaction.commit();
    return successResponse(req, res, "Split Request Rejected");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleRejectClosePOSupplier = async (req, res) => {
  try {
    const { id } = req.body.rq_body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    let supplierEmail = [];
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const checkTheCurrentID = await db.OFFERS.findOne({
      where: { id },
      include: [
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "user_supplier",
          attributes: ["supplier_id", "name", "email"],
        },
      ],
    });

    //restore the original data
    await db.OFFERS.update(
      {
        flag_status: "E",
        history: JSON.stringify([
          ...(JSON.parse(checkTheCurrentID.history) || []),
          {
            detail: `${moment().format(
              constant.FORMAT_DISPLAY_DATETIME
            )} Close PO Request Rejected by ${userName} and sent back to Supplier ${
              checkTheCurrentID?.supplier?.name
            }`,
            created_at: new Date(),
            created_by: userName,
          },
        ]),
        updated_by_id: userId,
        updated_at: new Date(),
      },
      {
        where: { id },
      }
    );
    supplierEmail.push(checkTheCurrentID?.user_supplier?.email);

    await sendEmailNotificationProcSupplier(
      "BKP - Close PO Request [Rejected]",
      `Close PO Request Rejected by PPIC ${userName}, please check to your account and resubmit the request if necessary`,
      [...new Set(supplierEmail)]
    );
    return successResponse(req, res, "Close PO Request Rejected");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleHistory = async (req, res) => {};

export const PPICScheduleHistoryAll = async (req, res) => {};

export const PPICScheduleTransactions = async (req, res) => {};

const OpenQueryPOOutsNoPO = async (poNumber, skuCode, transaction) => {
  const getLineNumber = await OpenQueryGetLineNum(poNumber, skuCode);
  const getPOOuts = (po) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (ORACLEPROD,'SELECT
      SUM(PO_DISTRIBUTIONS_ALL.QUANTITY_ORDERED - PO_DISTRIBUTIONS_ALL.QUANTITY_DELIVERED - PO_DISTRIBUTIONS_ALL.QUANTITY_CANCELLED) "QUANTITY_OUTSTANDING"
      FROM APPS.PO_HEADERS_ALL, APPS.PO_LINES_ALL, APPS.PO_DISTRIBUTIONS_ALL
      WHERE PO_HEADERS_ALL.SEGMENT1 = ''${po}''
        AND PO_LINES_ALL.LINE_NUM = ''${getLineNumber[0].line_number || 1}''
        AND PO_DISTRIBUTIONS_ALL.PO_HEADER_ID = PO_HEADERS_ALL.PO_HEADER_ID
        AND PO_LINES_ALL.PO_HEADER_ID = PO_HEADERS_ALL.PO_HEADER_ID')`;

    return queryWithSchema;
  };

  const rawQuery = getPOOuts(poNumber);

  try {
    const results = await db.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
      transaction,
    });
    return [true, results];
  } catch (error) {
    console.error(error.message);
    return [false, null];
  }
};
const OpenQueryPOOutsNoPR = async (prNumber, lineNumber) => {
  const getPOOuts = (pr, line) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (ORACLEPROD,'SELECT DISTINCT PO_REQUISITION_LINES_ALL.ITEM_DESCRIPTION "SKU_NAME",
    (MSI.SEGMENT1 || ''.'' || MSI.SEGMENT2|| ''.'' ||MSI.SEGMENT3) "SKU_CODE",
    PO_REQUISITION_LINES_ALL.QUANTITY "PR_QTY",
    PO_REQUISITION_HEADERS_ALL.SEGMENT1 "PR_NUMBER", 
    PO_REQUISITION_LINES_ALL.LINE_NUM "LINE_NUMBER",
    PAP.FULL_NAME BUYER_NAME, FU.USER_NAME,
    NVL (PO_REQUISITION_LINES_ALL.QUANTITY, 0) - NVL (PO_DISTRIBUTIONS_ALL.QUANTITY_ORDERED - PO_DISTRIBUTIONS_ALL.QUANTITY_CANCELLED, 0) "QUANTITY_OUTSTANDING"
     FROM PO.PO_REQUISITION_HEADERS_ALL,
          PO.PO_REQUISITION_LINES_ALL,
          PO.PO_REQ_DISTRIBUTIONS_ALL,
          PO.PO_DISTRIBUTIONS_ALL,
          APPS.MTL_SYSTEM_ITEMS MSI,
          APPS.PER_ALL_PEOPLE_F PAP,
          APPS.FND_USER FU
     WHERE PO_REQUISITION_HEADERS_ALL.SEGMENT1 = ''${pr}''
       AND PO_REQUISITION_LINES_ALL.LINE_NUM = ''${line || 1}''
       AND PO_REQUISITION_LINES_ALL.SUGGESTED_BUYER_ID = PAP.PERSON_ID
	     AND FU.EMPLOYEE_ID = PAP.PERSON_ID 
       AND PO_REQUISITION_HEADERS_ALL.REQUISITION_HEADER_ID = PO_REQUISITION_LINES_ALL.REQUISITION_HEADER_ID
       AND PO_REQUISITION_LINES_ALL.REQUISITION_LINE_ID = PO_REQ_DISTRIBUTIONS_ALL.REQUISITION_LINE_ID
       AND PO_DISTRIBUTIONS_ALL.REQ_DISTRIBUTION_ID(+) = PO_REQ_DISTRIBUTIONS_ALL.DISTRIBUTION_ID
       AND PO_REQUISITION_LINES_ALL.ITEM_ID = MSI.INVENTORY_ITEM_ID
       ')`;

    return queryWithSchema;
  };

  const rawQuery = getPOOuts(prNumber, lineNumber);

  try {
    const results = await db.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
    });

    return [true, results];
  } catch (error) {
    console.error(error.message);
    return [false, null];
  }
};

const OpenQueryPODetails = async (poNumber, lineNumber, transaction) => {
  const getPODetails = (po, line) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (ORACLEPROD,'select aps.vendor_name, pha.segment1, pla.line_num, pla.quantity, 
    SUM(pda.quantity_ordered-pda.quantity_delivered-pda.quantity_cancelled) qty_outs,pap.full_name buyer_name, fu.user_name,
    (msi.segment1 || ''.'' || msi.segment2 || ''.'' ||msi.segment3) kode_sku, msi.description nama_sku
    from APPS.po_headers_all pha, APPS.po_lines_all pla, APPS.po_distributions_all pda,
    APPS.ap_suppliers aps, APPS.mtl_system_items msi,APPS.per_all_people_f pap, APPS.fnd_user fu
    where 1=1
    and pha.segment1 = ''${po}''
	and pha.agent_id = pap.person_id
	and fu.employee_id = pap.person_id 
    and pha.po_header_id = pla.po_header_id
    and pla.po_line_id = pda.po_line_id
    and pla.line_num = ''${line}''
    and pha.vendor_id = aps.vendor_id
    and pla.item_id = msi.inventory_item_id
    and msi.organization_id = 101
    group by aps.vendor_Name, pha.segment1,
    pla.line_num, pla.quantity,pap.full_name, fu.user_name,
    (msi.segment1 || ''.'' || msi.segment2 || ''.'' ||msi.segment3), 
    msi.description')`;

    return queryWithSchema;
  };

  const rawQuery = getPODetails(poNumber, lineNumber);

  try {
    const results = await db.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
      transaction,
    });
    return [true, results];
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

const OpenQueryGetLineNum = async (poNumber, skuCode, transaction) => {
  const skuSplit = skuCode.split(".");
  console.log(skuSplit, "skuSplit");
  console.log(poNumber.replace(/[^a-zA-Z0-9 ]/g, ""));
  const getPODetails = (po, skucode) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (ORACLEPROD,'SELECT APS.VENDOR_NAME, PHA.SEGMENT1 PO_NUMBER, PLA.LINE_NUM , PLA.QUANTITY, 
    SUM(PDA.QUANTITY_ORDERED-PDA.QUANTITY_DELIVERED-PDA.QUANTITY_CANCELLED) QTY_OUTS,
    PLA.LINE_NUM LINE_NUMBER, MSI.DESCRIPTION NAMA_SKU,FU.USER_NAME BUYER_NAME
    FROM APPS.PO_HEADERS_ALL PHA, APPS.PO_LINES_ALL PLA, APPS.PO_DISTRIBUTIONS_ALL PDA,
    APPS.AP_SUPPLIERS APS,APPS.MTL_SYSTEM_ITEMS MSI,APPS.PER_ALL_PEOPLE_F PAP, APPS.FND_USER FU
    WHERE 1=1
    AND PHA.SEGMENT1 = ''${po.replace(/[^a-zA-Z0-9 ]/g, "")}''
    AND PHA.PO_HEADER_ID = PLA.PO_HEADER_ID
    AND PLA.PO_LINE_ID = PDA.PO_LINE_ID
    AND MSI.SEGMENT1 = ''${skucode[0].replace(/[^a-zA-Z0-9 ]/g, "")}''
    AND MSI.SEGMENT2 = ''${skucode[1].replace(/[^a-zA-Z0-9 ]/g, "")}''
    AND MSI.SEGMENT3 = ''${skucode[2].replace(/[^a-zA-Z0-9 ]/g, "")}''
    AND PHA.VENDOR_ID = APS.VENDOR_ID
    AND PLA.ITEM_ID = MSI.INVENTORY_ITEM_ID
    AND MSI.ORGANIZATION_ID = 101
    AND PHA.AGENT_ID = PAP.PERSON_ID
    AND FU.EMPLOYEE_ID = PAP.PERSON_ID 
    AND PLA.CANCEL_FLAG = ''N''
    GROUP BY APS.VENDOR_NAME, PHA.SEGMENT1,
    PLA.LINE_NUM, PLA.QUANTITY,
    (MSI.SEGMENT1 || ''.'' || MSI.SEGMENT2 || ''.'' ||MSI.SEGMENT3), 
    MSI.DESCRIPTION,FU.USER_NAME')`;

    return queryWithSchema;
  };

  const rawQuery = getPODetails(poNumber, skuSplit);

  try {
    const results = await db.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
      transaction,
    });
    return [true, results];
  } catch (error) {
    console.error(error.message);
    return [false, null];
  }
};

const OpenQueryPODetailsPOOnly = async (poNumber, transaction) => {
  const getPODetails = (po) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (ORACLEPROD,'SELECT APS.VENDOR_NAME "SUPPLIER_NAME", PHA.SEGMENT1 "PO_NUMBER", PLA.LINE_NUM, PLA.QUANTITY PO_QTY, 
    SUM(PDA.QUANTITY_ORDERED-PDA.QUANTITY_DELIVERED-PDA.QUANTITY_CANCELLED) QUANTITY_OUTSTANDING,PAP.FULL_NAME BUYER_NAME, FU.USER_NAME,
    (MSI.SEGMENT1 || ''.'' || MSI.SEGMENT2 || ''.'' ||MSI.SEGMENT3) SKU_CODE, MSI.DESCRIPTION SKU_NAME
    FROM APPS.PO_HEADERS_ALL PHA, APPS.PO_LINES_ALL PLA, APPS.PO_DISTRIBUTIONS_ALL PDA,
    APPS.AP_SUPPLIERS APS, APPS.MTL_SYSTEM_ITEMS MSI,APPS.PER_ALL_PEOPLE_F PAP, APPS.FND_USER FU
    WHERE 1=1
    AND PHA.SEGMENT1 = ''${po}''
    AND PHA.AGENT_ID = PAP.PERSON_ID
    AND FU.EMPLOYEE_ID = PAP.PERSON_ID 
    AND PHA.PO_HEADER_ID = PLA.PO_HEADER_ID
    AND PLA.PO_LINE_ID = PDA.PO_LINE_ID
    AND PHA.VENDOR_ID = APS.VENDOR_ID
    AND PLA.ITEM_ID = MSI.INVENTORY_ITEM_ID
    AND MSI.ORGANIZATION_ID = 101
    AND PLA.CANCEL_FLAG =''N''
    GROUP BY APS.VENDOR_NAME, PHA.SEGMENT1,
    PLA.LINE_NUM, PLA.QUANTITY,PAP.FULL_NAME, FU.USER_NAME,
    (MSI.SEGMENT1 || ''.'' || MSI.SEGMENT2 || ''.'' ||MSI.SEGMENT3), 
    MSI.DESCRIPTION')`;

    return queryWithSchema;
  };

  const rawQuery = getPODetails(poNumber);

  try {
    const results = await db.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
    });
    return [true, results];
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

const OpenQueryPRDetailsPROnly = async (prNumber, transaction) => {
  const getPODetails = (pr) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (ORACLEPROD,'SELECT DISTINCT PRLA.QUANTITY "PR_QTY",
    NVL (PRLA.QUANTITY, 0) - NVL (PDA.QUANTITY_ORDERED - PDA.QUANTITY_CANCELLED, 0) "QUANTITY_OUTSTANDING",
    (MSI.SEGMENT1 || ''.'' || MSI.SEGMENT2 || ''.'' ||MSI.SEGMENT3) "SKU_CODE",PRLA.ITEM_DESCRIPTION "SKU_NAME",
    PRLA.LINE_NUM "LINE_NUM" , PRHA.SEGMENT1 "PR_NUMBER", PAP.FULL_NAME "BUYER_NAME", FU.USER_NAME, PRLA.CREATION_DATE "TANGGAL DIBUAT"
     FROM PO.PO_REQUISITION_HEADERS_ALL PRHA, PO.PO_REQUISITION_LINES_ALL PRLA,
      PO.PO_REQ_DISTRIBUTIONS_ALL PRDA, PO.PO_DISTRIBUTIONS_ALL PDA, APPS.MTL_SYSTEM_ITEMS MSI, APPS.PER_ALL_PEOPLE_F PAP, APPS.FND_USER FU
      WHERE 1=1 
        AND PRHA.SEGMENT1 = ''${pr}''
        AND PRHA.REQUISITION_HEADER_ID =PRLA.REQUISITION_HEADER_ID
        AND PRLA.REQUISITION_LINE_ID = PRDA.REQUISITION_LINE_ID
        AND PDA.REQ_DISTRIBUTION_ID(+) = PRDA.DISTRIBUTION_ID
        AND PRLA.SUGGESTED_BUYER_ID = PAP.PERSON_ID
        AND FU.EMPLOYEE_ID = PAP.PERSON_ID 
        AND PRLA.CANCEL_FLAG=''N''
        AND PRLA.ITEM_ID = MSI.INVENTORY_ITEM_ID')`;

    return queryWithSchema;
  };

  const rawQuery = getPODetails(prNumber);

  try {
    const results = await db.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
      transaction,
    });
    return [true, results];
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

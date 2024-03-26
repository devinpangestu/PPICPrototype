import db from "../models/index.js";
import {
  successResponse,
  errorResponse,
  errorResponseUnauthorized,
  uniqueId,
} from "../helpers/index.js";
import { Op, Sequelize, literal } from "sequelize";
import { getSupplierID, getUserID, getUserName } from "../utils/auth.js";
import {
  parsingStringToDateEarly,
  parsingStringToDateLate,
  parsingDateToString,
} from "../utils/parsing.js";
import { getOutsQtyEachPOSKU } from "../utils/checker.js";
import {
  filterDeletedDoubleFindCount,
  filterDoubleFindCount,
} from "../utils/filter.js";
import { constant } from "../constant/index.js";
import moment from "moment";
import { OpenQueryGetLineNum, OpenQueryPOOuts } from "../utils/openQuery.js";
import sendEmailNotificationProcSupplier from "../utils/emailTemplate/sendEmailNotificationProcSupplier.js";
import sendEmailNotificationProcPPICEdit from "../utils/emailTemplate/sendEmailNotificationProcPPICEdit.js";
import sendEmailNotificationProcPPICSplit from "../utils/emailTemplate/sendEmailNotificationProcPPICSplit.js";
import sendEmailNotificationProcPPICClosePO from "../utils/emailTemplate/sendEmailNotificationProcPPICClosePO.js";

export const PurchasingScheduleSummary = async (req, res) => {
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
      whereClauseDeleted[Op.and].push({ buyer_id: user_id });
      whereClause[Op.and].push({ buyer_id: user_id });
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

export const PurchasingScheduleList = async (req, res) => {
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
      whereClause[Op.and].push({ buyer_id: user_id });
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
          ["B", "D", "A", "C", "E", "F", "G", "X"],
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

export const PurchasingScheduleNeedActionMinDate = async (req, res) => {
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
        flag_status: ["B", "D", "F"],
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

export const PurchasingScheduleCreate = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const {
      submission_date,
      supplier_name,
      po_number,
      po_qty,
      po_outs,
      sku_code,
      sku_name,
      qty_delivery,
      est_delivery,
      mass,
    } = req.body.rq_body;
    const isMass = req.query.mass;
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    //check if id ship is exist

    if (isMass) {
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
            supplier_id: supplier.id, //dicari dulu id nya sesuai
            po_number: rowToInsert.po_number,
            po_qty: Number(rowToInsert.po_qty),
            po_outs: Number(rowToInsert.po_outs),
            sku_code: rowToInsert.sku_code,
            sku_name: rowToInsert.sku_name,
            qty_delivery: Number(rowToInsert.qty_delivery),
            est_delivery: {
              [Op.between]: [
                parsingStringToDateEarly(rowToInsert.est_delivery),
                parsingStringToDateLate(rowToInsert.est_delivery),
              ],
            },
          },
        };

        const checkIfDataExist = await db.OFFERS.findOne({
          where: payloadToCheck,
        });

        if (checkIfDataExist) {
          return errorResponse(
            req,
            res,
            "Ada data duplikat, mohon cek kembali"
          );
        }

        await db.OFFERS.create(
          {
            submission_date: rowToInsert.submission_date,
            supplier_id: supplier.id, //dicari dulu id nya sesuai
            po_number: rowToInsert.po_number,
            po_qty: Number(rowToInsert.po_qty),
            po_outs: Number(rowToInsert.po_outs),
            sku_code: rowToInsert.sku_code,
            sku_name: rowToInsert.sku_name,
            qty_delivery: Number(rowToInsert.qty_delivery),
            est_delivery: rowToInsert.est_delivery,
            created_by_id: userId,
            updated_by_id: userId,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction: dbTransaction }
        );
      }
      await dbTransaction.commit();
      return successResponse(req, res, "Success Import Data Jadwal Pengiriman");
    } else {
      //check if name is exist
      const checkIfDataExist = await db.OFFERS.findAll({
        where: {
          submission_date,
          supplier_id: supplier_name, //dicari dulu id nya sesuai
          po_number,
          sku_code,
          sku_name,
          // qty_delivery,
          // est_delivery,
        },
        raw: true,
      });
      if (checkIfDataExist) {
        const sumQtyDelivery = checkIfDataExist.reduce((total, obj) => {
          return total + Number(obj.qty_delivery);
        }, 0);

        if (sumQtyDelivery > po_outs) {
          return errorResponse(
            req,
            res,
            "Jumlah quantity pengiriman melebihi outstanding quantity, mohon cek kembali"
          );
        }
      }
      await db.OFFERS.create(
        {
          submission_date,
          supplier_id: supplier_name, //dicari dulu id nya sesuai
          po_number,
          po_qty,
          po_outs,
          sku_code,
          sku_name,
          qty_delivery,
          est_delivery,
          created_by_id: userId,
          updated_by_id: userId,
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

export const PurchasingScheduleSplitPurchasing = async (req, res) => {
  const dbTransactionUpdate = await db.sequelize.transaction();
  const dbTransactionDelete = await db.sequelize.transaction();
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
        transaction: dbTransactionUpdate,
      });
      await dbTransactionUpdate.commit();
    }

    // Delete the original entry
    await db.OFFERS.destroy(
      {
        where: { id: offer_id },
      },
      { transaction: dbTransactionDelete }
    );
    // Commit the transaction
    await dbTransactionDelete.commit();

    return successResponse(req, res, "Schedule splitted");
  } catch (error) {
    await dbTransactionDelete.rollback();
    await dbTransactionUpdate.rollback();

    return errorResponse(req, res, error.message);
  }
};

export const PurchasingScheduleGet = async (req, res) => {
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
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name", "email"],
        },
        {
          model: db.USERS,
          as: "buyer",
          attributes: ["id", "name", "email", "oracle_username"],
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

export const PurchasingScheduleEdit = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    //TODO MASS EDIT
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
    //check if id ship is exist
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
          raw: true,
        });
        const history = JSON.parse(getExistingHistory?.history);
        const getNotes = JSON.parse(getExistingHistory?.notes);
        console.log({
          history: JSON.stringify([
            ...(history || []),
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Schedule Force Edited by ${userName},
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
            notes: JSON.stringify({
              ...getNotes,
              init: {
                notes: notes,
                created_at: new Date(),
                created_by: userName,
              },
            }),
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
          return errorResponse(
            req,
            res,
            "Data PR tidak dapat diubah menjadi PR kembali, silahkan hubungi PPIC"
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
          console.log(1085);
          const getExistingHistory = await db.OFFERS.findOne({
            where: { id },
            raw: true,
          });
          console.log(1090);
          const history = JSON.parse(getExistingHistory?.history);
          console.log({
            submission_date: new Date(submission_date),
            supplier_id: getSupplierId?.ref_id, //dicari dulu id nya sesuai
            po_number,
            po_qty: Number(resultLine[0].QUANTITY),
            po_outs: Number(resultLine[0].QTY_OUTS),
            sku_code,
            sku_name,
            line_num: Number(resultLine[0].LINE_NUMBER),
            qty_delivery: Number(resultLine[0].QTY_OUTS),
            est_delivery: new Date(est_delivery),
            updated_by_id: Number(userId),
            updated_at: new Date(),
            buyer_id: getBuyerId.id,
          });

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
              qty_delivery: Number(resultLine[0].QTY_OUTS),
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
    //check if name is exist

    return successResponse(req, res, "Success Insert Data Jadwal Pengiriman");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PurchasingScheduleRetur = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const id = req.params.id;
    const { notes_purchasing } = req.body.rq_body;
    const userId = getUserID(req);
    const userName = getUserName(req);
    const checkId = await db.OFFERS.findOne({
      where: {
        id,
        deleted_at: null,
      },
    });
    if (!checkId) {
      return errorResponse(
        req,
        res,
        "Data dengan id tersebut tidak ditemukan atau sudah dihapus"
      );
    }

    const getExistingNotes = JSON.parse(checkId.notes);
    const getExistingHistory = JSON.parse(checkId.history);

    const payload = {
      flag_status: "C", //status for get retur from procurement to ppic
      notes: JSON.stringify({
        ...getExistingNotes,
        retur: {
          notes: notes_purchasing,
          created_at: new Date(),
          created_by: userName,
        },
      }),
      history: JSON.stringify([
        ...(getExistingHistory || []),
        {
          detail: `${moment().format(
            constant.FORMAT_DISPLAY_DATETIME
          )} Retur Schedule by ${userName}`,
          created_at: new Date(),
          created_by: userName,
        },
      ]),
      updated_by_id: userId,
      updated_at: new Date(),
    };

    await db.OFFERS.update(
      payload,
      { where: { id } },
      { transaction: dbTransaction }
    );
    // const payloadDeletedAt = { deleted_at: new Date(), deleted_by_id: userId };
    // await db.OFFERS.update(
    //   payloadDeletedAt,
    //   {
    //     where: { id },
    //   },
    //   { transaction: dbTransaction }
    // );
    await dbTransaction.commit();
    return successResponse(req, res, "Success Retur Jadwal Pengiriman ke PPIC");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};

export const PurchasingScheduleSendToSupplier = async (req, res) => {
  try {
    const { rq_body } = req.body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    //check if id ship is exist
    let supplierId = [];
    for (let key in rq_body) {
      let rowToUpdate = rq_body[key];
      //check id for supplier
      const id = rowToUpdate.id;
      const getExistingHistory = JSON.parse(rowToUpdate.history);

      await db.OFFERS.update(
        {
          flag_status: "E",
          updated_by_id: userId,
          updated_at: new Date(),
          send_supplier_date: new Date(),
          history: JSON.stringify([
            ...(getExistingHistory || []),
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Schedule sent to ${
                rowToUpdate?.supplier?.name
              } by ${userName}`,
              created_at: new Date(),
              created_by: userName,
            },
          ]),
        },
        {
          where: { id },
        }
      );

      supplierId.push(rowToUpdate.supplier.ref_id);
    }
    const uniqueSupplierId = [...new Set(supplierId)];
    console.log(uniqueSupplierId);
    let supplierEmail = await db.USERS.findAll({
      where: {
        supplier_id: uniqueSupplierId,
      },
      attributes: ["email"],
      raw: true,
    });
    if (!supplierEmail) {
      supplierEmail = await db.SUPPLIERS.findAll({
        where: {
          ref_id: uniqueSupplierId,
        },
        attributes: ["email"],
        raw: true,
      });
    }
    await sendEmailNotificationProcSupplier(
      "BKP - Jadwal Pengiriman Barang",
      "New Schedule has been submitted, please check to your account",
      supplierEmail.map((item) => item.email)
    );
    return successResponse(
      req,
      res,
      "Sukses Memberikan Jadwal Pengiriman kepada Supplier"
    );
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PurchasingScheduleAcceptSplitSupplier = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { id } = req.body.rq_body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    let ppicEmail = [];
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
        flag_status: "F",
      },
    });

    //update the status of splitted data
    for (let key in checkAnotherSplit) {
      await db.OFFERS.update(
        {
          flag_status: "G",
          history: JSON.stringify([
            ...(JSON.parse(checkAnotherSplit[key].dataValues.history) || []),
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Split Schedule Request Accepted by ${userName} and forwarded to PPIC`,
              created_at: new Date(),
              created_by: userName,
            },
          ]),
          updated_by_id: userId,
          updated_at: new Date(),
        },
        {
          where: { id: checkAnotherSplit[key].id },
        }
      );
      ppicEmail.push(checkAnotherSplit[key].crtd_by?.email);
    }
    await sendEmailNotificationProcPPICSplit(
      "BKP - Schedule Split Request",
      `New Schedule Split Request Submitted by Supplier ${userName}, please check to your account`,
      [...new Set(ppicEmail)]
    );
    return successResponse(req, res, "Split Request Accepted");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PurchasingScheduleRejectSplitSupplier = async (req, res) => {
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
    const checkAnotherSplit = await db.OFFERS.findAll({
      where: {
        split_from_id: checkTheCurrentID.split_from_id,
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
      `Split Request Rejected by Procurement ${userName}, please check to your account and resubmit the request if necessary`,
      [...new Set(supplierEmail)]
    );
    return successResponse(req, res, "Split Request Rejected");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PurchasingScheduleAcceptEditSupplier = async (req, res) => {
  try {
    const { id } = req.body.rq_body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    let ppicEmail = [];
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
        flag_status: "F",
      },
    });
    //update the status of editted data
    for (let key in checkAnotherEditedOffer) {
      await db.OFFERS.update(
        {
          flag_status: "G",
          history: JSON.stringify([
            ...(JSON.parse(checkAnotherEditedOffer[key]?.dataValues.history) ||
              []),
            {
              detail: `${moment().format(
                constant.FORMAT_DISPLAY_DATETIME
              )} Edit Schedule Request Accepted by ${userName} and forwarded to PPIC`,
              created_at: new Date(),
              created_by: userName,
            },
          ]),
          updated_by_id: userId,
          updated_at: new Date(),
        },
        {
          where: { id: checkAnotherEditedOffer[key].id, is_edit: false },
        }
      );
      ppicEmail.push(checkAnotherEditedOffer[key].crtd_by?.email);
    }
    await sendEmailNotificationProcPPICEdit(
      "BKP - Schedule Edit Request",
      `New Schedule Edit Request Submitted by Supplier ${userName}, please check to your account`,
      [...new Set(ppicEmail)]
    );
    return successResponse(req, res, "Split Request Rejected");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PurchasingScheduleRejectEditSupplier = async (req, res) => {
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
        is_edit: false,
        flag_status: "F",
      },
    });
    for (let key in checkAnotherEditedOffer) {
      //restore the original data
      await db.OFFERS.update(
        {
          flag_status: "E",
          history: JSON.stringify([
            ...(JSON.parse(checkAnotherEditedOffer[key]?.dataValues.history) ||
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
          where: { id: checkAnotherEditedOffer[key].dataValues.edit_from_id },
        },
        { transaction: dbTransaction }
      );
      //delete the splitted data
      await db.OFFERS.destroy({
        where: { id: checkAnotherEditedOffer[key].dataValues.id },
      });
      supplierEmail.push(checkAnotherEditedOffer[key].user_supplier?.email);
    }

    await sendEmailNotificationProcSupplier(
      "BKP - Schedule Edit Request [Rejected]",
      `Edit Request Rejected by Procurement ${userName}, please check to your account and resubmit the request if necessary`,
      [...new Set(supplierEmail)]
    );
    return successResponse(req, res, "Edit Request Rejected");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PurchasingScheduleAcceptClosePOSupplier = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { id } = req.body.rq_body;
    const userName = getUserName(req);
    const userId = getUserID(req);
    let ppicEmail = [];
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
        flag_status: "G",
        history: JSON.stringify([
          ...(JSON.parse(checkTheCurrentID?.history) || []),
          {
            detail: `${moment().format(
              constant.FORMAT_DISPLAY_DATETIME
            )} Close PO Schedule Request Accepted by ${userName} and forwarded to PPIC`,
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
    ppicEmail.push(checkTheCurrentID?.crtd_by?.email);
    await sendEmailNotificationProcPPICClosePO(
      "BKP - Schedule Close PO Request",
      `New Close PO Request Submitted by Supplier ${userName}, please check to your account`,
      [...new Set(ppicEmail)]
    );

    return successResponse(req, res, "Close PO Request Approved");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PurchasingScheduleRejectClosePOSupplier = async (req, res) => {
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
      "BKP - Schedule Close PO Request [Rejected]",
      `Close PO Request Rejected by Procurement ${userName}, please check to your account and resubmit the request if necessary`,
      [...new Set(supplierEmail)]
    );
    return successResponse(req, res, "Close PO Request Rejected");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PurchasingScheduleHistory = async (req, res) => {};

export const PurchasingScheduleHistoryAll = async (req, res) => {};

export const PurchasingScheduleTransactions = async (req, res) => {};

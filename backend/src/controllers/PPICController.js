import db from "../models/index.js";
import {
  successResponse,
  errorResponse,
  errorResponseUnauthorized,
  uniqueId,
} from "../helpers/index.js";
import { Op, Sequelize, literal } from "sequelize";
import { getUserID } from "../utils/auth.js";
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

export const PPICScheduleSummary = async (req, res) => {
  try {
    const { from_date, to_date, user_id, supplier_id, status } = req.query;
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
      whereClause[Op.and].push({ created_by_id: user_id }); //TODO cari user id
    }

    if (supplier_id) {
      whereClauseDeleted[Op.and].push({ supplier_id: supplier_id });
      whereClause[Op.and].push({ supplier_id: supplier_id });
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
  const { from_date, to_date, status, supplier_id, user_id } = req.query;
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
      [Op.and]: [],
    };
    if (status) {
      if (status === "deleted") {
        whereClause[Op.and].push({ [Op.not]: [{ deleted_at: null }] });
      } else if (status === "allSchedules") {
        whereClause[Op.and].push({ deleted_at: null });
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
    if (user_id) {
      whereClause[Op.and].push({ created_by_id: user_id });
    } //TODO mungkin berubah
    const data = await db.OFFERS.findAndCountAll({
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name"],
        },
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name"],
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
export const PPICScheduleCreate = async (req, res) => {
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
            supplier_id: supplier.ref_id, //dicari dulu id nya sesuai
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
            created_by_id: userId,
            deleted_at: null,
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
            supplier_id: supplier.ref_id, //dicari dulu id nya sesuai
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
          { dbTransaction }
        );
      }
      return successResponse(req, res, "Success Import Data Jadwal Pengiriman");
    } else {
      //check if name is exist
      const checkIfDataExist = await db.OFFERS.findOne({
        where: {
          submission_date,
          supplier_id: supplier_name, //dicari dulu id nya sesuai
          po_number,
          po_qty,
          po_outs,
          sku_code,
          sku_name,
          qty_delivery,
          est_delivery,
        },
      });

      if (checkIfDataExist) {
        return errorResponse(req, res, "Ada data duplikat, mohon cek kembali");
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
        { dbTransaction }
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
      await db.OFFERS.create(payloadForSplittedSchedule, { dbTransaction });
    }

    // Delete the original entry
    await db.OFFERS.destroy(
      {
        where: { id: offer_id },
      },
      { dbTransaction }
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
          attributes: ["id", "name"],
        },
        {
          model: db.SUPPLIERS,
          as: "supplier",
          attributes: ["id", "ref_id", "name"],
        },
      ],
      where: { id },
    });
    return successResponse(req, res, data);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleEdit = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  //TODO MASS EDIT
  try {
    const { schedules } = req.body.rq_body;
    const userId = getUserID(req);
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
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
        supplier,
      } = schedules[key];
      const checkIfDataExist = await db.OFFERS.findOne({
        where: {
          submission_date,
          supplier_id: supplier.ref_id, //dicari dulu id nya sesuai
          po_number,
          po_qty,
          po_outs,
          sku_code,
          sku_name,
          qty_delivery,
          est_delivery,
        },
      });

      if (checkIfDataExist) {
        return errorResponse(req, res, "Ada data duplikat, mohon cek kembali");
      }
      await db.OFFERS.update(
        {
          submission_date,
          supplier_id: supplier.ref_id, //dicari dulu id nya sesuai
          po_number,
          po_qty,
          po_outs,
          sku_code,
          sku_name,
          qty_delivery,
          est_delivery,
          updated_by_id: userId,
          updated_at: new Date(),
        },
        {
          where: { id },
        },
        { dbTransaction }
      );
    }

    await dbTransaction.commit();
    return successResponse(req, res, "Success Insert Data Jadwal Pengiriman");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleDelete = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    console.log(req);
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
      { dbTransaction }
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
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    //check if id ship is exist

    for (let key in rq_body) {
      let rowToUpdate = rq_body[key];
      //check id for supplier
      const id = rowToUpdate.id;
      if (rowToUpdate.flag_status == "A") {
        await db.OFFERS.update(
          { flag_status: "B", updated_by_id: userId },
          {
            where: { id },
          },
          { dbTransaction }
        );
      } else if (rowToUpdate.flag_status == "C") {
        await db.OFFERS.update(
          { flag_status: "D", updated_by_id: userId },
          {
            where: { id },
          },
          { dbTransaction }
        );
      }
    }
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
    if (!userId) {
      return errorResponseUnauthorized(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const checkTheCurrentID = await db.OFFERS.findOne({
      where: { id },
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
          flag_status: "X",
          split_from_id: null,
          updated_by_id: userId,
          updated_at: new Date(),
        },
        {
          where: { id: checkAnotherSplit[key].id },
        },
        { dbTransaction }
      );
    }
    //delete the original data
    await db.OFFERS.destroy(
      {
        where: { id: checkTheCurrentID.split_from_id },
      },
      { dbTransaction }
    );

    return successResponse(req, res, "Split Request Accepted");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleRejectSplitSupplier = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { id } = req.body.rq_body;

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
        is_split: false,
        updated_by_id: userId,
        updated_at: new Date(),
      },
      {
        where: { id: checkTheCurrentID.split_from_id },
      },
      { dbTransaction }
    );

    //delete the splitted data
    for (let key in checkAnotherSplit) {
      await db.OFFERS.destroy(
        {
          where: { id: checkAnotherSplit[key].id },
        },
        { dbTransaction }
      );
    }
    return successResponse(req, res, "Split Request Rejected");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};
export const PPICScheduleAcceptEditSupplier = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { id } = req.body.rq_body;

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
    });
    const checkAnotherEditedOffer = await db.OFFERS.findAll({
      where: {
        po_number: checkTheCurrentID.po_number,
        sku_code: checkTheCurrentID.sku_code,
        [Op.not]: [{ is_edit: null }],
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
          edit_from_id: null,
          flag_status: "X",
          updated_by_id: userId,
          updated_at: new Date(),
        },
        {
          where: { id: checkAnotherEditedOffer[key].id },
        },
        { dbTransaction }
      );
      //delete the original data
      await db.OFFERS.destroy(
        {
          where: { id: checkAnotherEditedOffer[key].dataValues.edit_from_id },
        },
        { dbTransaction }
      );
    }

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
    });
    const checkAnotherEditedOffer = await db.OFFERS.findAll({
      where: {
        po_number: checkTheCurrentID.po_number,
        sku_code: checkTheCurrentID.sku_code,
        [Op.not]: [{ is_edit: null }],
        flag_status: "G",
      },
    });
    for (let key in checkAnotherEditedOffer) {
      //restore the original data
      await db.OFFERS.update(
        {
          flag_status: "E",
          is_edit: false,
          updated_by_id: userId,
          updated_at: new Date(),
        },
        {
          where: { id: checkAnotherEditedOffer[key].dataValues.edit_from_id },
        },
        { dbTransaction }
      );
      //delete the splitted data
      await db.OFFERS.destroy(
        {
          where: { id: checkAnotherEditedOffer[key].dataValues.id },
        },
        { dbTransaction }
      );
    }
    return successResponse(req, res, "Split Request Rejected");
  } catch (error) {
    await dbTransaction.rollback();
    return errorResponse(req, res, error.message);
  }
};

export const PPICScheduleHistory = async (req, res) => {};

export const PPICScheduleHistoryAll = async (req, res) => {};

export const PPICScheduleTransactions = async (req, res) => {};

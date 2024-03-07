import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Sequelize, Op, where, literal } from "sequelize";
import { getUserID } from "../utils/auth.js";
import { cleanOpenQuery } from "../utils/cleanOpenQuery.js";
import crypto from "crypto";
import env from "../utils/validateEnv.js";
import jwt from "jsonwebtoken";
import { constant } from "../constant/index.js";
import { sendEmailVerification } from "../utils/emailTemplate/sendEmailVerification.js";
import bcrypt from "bcrypt";

export const PPICSupplierList = async (req, res) => {
  try {
    const { search, ref_id, for_options } = req.query;
    const page_number = parseInt(req.query.page_number) || 1;
    const page_size = parseInt(req.query.page_size) || 10;
    const offset = (page_number - 1) * page_size;

    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }
    const whereClause = { deleted_at: null };

    let data;
    if (for_options) {
      data = await db.SUPPLIERS.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("name")), "name"],
          "ref_id",
        ],
        where: {
          deleted_at: null,
        },
      });
      return successResponse(req, res, { suppliers: data });
    } else {
      if (ref_id) {
        whereClause.ref_id = ref_id;
      }
      data = await db.SUPPLIERS.findAndCountAll({
        where: whereClause,
        offset: offset,
        limit: page_size,
        order: [["id", "ASC"]],
      });
      return successResponse(req, res, {
        suppliers: data.rows,
        total: data.count,
      });
    }
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICSupplierRefreshOracle = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const userId = getUserID(req);
    if (!userId) {
      await transaction.rollback();
      return errorResponse(req, res, "User not authorized");
    }

    const err = await refreshOracle(transaction);
    if (!err) {
      await transaction.rollback();
      return errorResponse(
        req,
        res,
        "An error occurred while refreshing supplier data"
      );
    }
    transaction.commit();
    return successResponse(req, res, "Data updated and inserted successfully.");
  } catch (error) {
    await transaction.rollback();
    return errorResponse(req, res, error.message);
  }
};
export const PPICSupplierCreateUserAndSendEmail = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }
    const supplier = await db.SUPPLIERS.findOne({
      where: {
        id,
      },
    });
    if (!supplier) {
      return errorResponse(req, res, "Supplier not found");
    }
    const user = await db.USERS.findOne({
      where: {
        email: supplier.email,
        deleted_at: null,
      },
    });
    if (user) {
      return errorResponse(req, res, "User already exist");
    }
    const payloadSupplierUpdate = {
      user_status: true,
    };
    await db.SUPPLIERS.update(
      payloadSupplierUpdate,
      {
        where: {
          id,
        },
      },
      { dbTransaction }
    );

    const passwordToCreate = uniqueId(8);
    const newPasswordToHash = await bcrypt.hash(passwordToCreate, 4);

    const token = jwt.sign(
      { email: supplier.email, id: supplier.ref_id },
      constant.SECRET_AUTH,
      {
        expiresIn: "1h",
      }
    );

    const currentTime = Date.now();
    const lastSentTime = token.lastSentAt;

    if (lastSentTime && currentTime - lastSentTime < 60000) {
      // Gap time has not passed, return a response with remaining time
      const remainingTime = Math.ceil(
        (60000 - (currentTime - lastSentTime)) / 1000
      );
      console.log(remainingTime);
      return successResponse(
        req,
        res,
        `Email sent. Please wait ${remainingTime} seconds before sending another request`
      );
    }
    //TODO : ADD SEND EMAIL
    await sendEmailVerification(
      supplier.email,
      `Welcoming ${supplier.name}!`,
      passwordToCreate
    );
    await db.USERS.create({
      email: supplier.email,
      user_id: supplier.email,
      password: newPasswordToHash,
      name: `${supplier.name}`,
      supplier_id: supplier.ref_id,
      role_id: 4,
      created_at: new Date(),
      updated_at: new Date(),
      created_by_id: userId,
      last_used_password: JSON.stringify([`${newPasswordToHash}`]),
    });
    return successResponse(
      req,
      res,
      `Create User Request Sent to ${supplier.name}`
    );
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
export const PPICSupplierCreate = async (req, res) => {
  // const supplier_id_params = req.params.supplier_id;
  const { name, site_ids, supplier_id } = req.body.rq_body;
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }
    const payloadSuppliers = { name, supplier_id, created_at: new Date() };

    //check if supplier_id is exist in table
    const checkSupplierId = await db.SUPPLIERS.findOne({
      where: {
        supplier_id,
      },
    });
    if (checkSupplierId) {
      return errorResponse(req, res, "Supplier ID is already exist");
    }

    const createTable = await db.SUPPLIERS.create(payloadSuppliers, {
      fields: ["name", "supplier_id", "created_at"],
      raw: true,
    });
    //create data to table supplier_site by looping of object site_ids
    const payloadSupplierSite = site_ids.map((item) => {
      return {
        supplier_id: createTable.id,
        name: item.name,
        commodity_id: item.commodity_id,
        site_id: item.site_id,
        created_at: new Date(),
        updated_at: new Date(),
      };
    });
    const createTableSite = await db.SUPPLIER_SITE.create(payloadSupplierSite);

    return successResponse(req, res, {
      message: "Success create data Supplier",
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICSupplierGet = async (req, res) => {
  const { supplier_id } = req.params;
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }
    const data = await db.SUPPLIERS.findOne({
      attributes: [
        "id",
        "supplier_id",
        "name",
        "created_at",
        "updated_at",
        "updated_by_id",
      ],
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["name", "created_at"],
        },
        {
          model: db.SUPPLIER_SITE,
          as: "site_ids",
          attributes: [
            "id",
            "supplier_id",
            "commodity_id",
            "site_id",
            "created_at",
            "created_by_id",
            "updated_at",
            "updated_by_id",
          ],
        },
      ],
      where: {
        supplier_id,
      },
    });
    return successResponse(req, res, data);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICSupplierEdit = async (req, res) => {
  const { name, site_ids, supplier_id } = req.body.rq_body;
  const supplier_id_params = req.params.supplier_id;

  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }
    // Check if supplier_id params exist in the table
    const checkSupplierId = await db.SUPPLIERS.findOne({
      where: {
        supplier_id,
      },
    });
    if (checkSupplierId && supplier_id_params !== checkSupplierId.supplier_id) {
      return errorResponse(
        req,
        res,
        "Supplier ID already exist or has changed"
      );
    }

    const updatePayload = {
      name,
      supplier_id,
      updated_at: new Date(),
    };

    // Update the suppliers table
    await db.SUPPLIERS.update(updatePayload, {
      fields: ["name", "supplier_id", "updated_at"],
      where: {
        supplier_id: supplier_id_params,
      },
      raw: true,
    });

    // Get id from supplier
    const supplierId = await db.SUPPLIERS.findOne({
      attributes: ["id", "supplier_id", "created_at"],
      where: { supplier_id },
    });

    // Create payload for supplier_site
    const payloadSupplierSite = site_ids.map((item) => ({
      supplier_id: supplierId.id,
      commodity_id: item.commodity_id,
      site_id: item.site_id,
      created_at: supplierId.created_at,
      updated_at: new Date(),
    }));

    // Delete existing supplier_site data
    await db.SUPPLIER_SITE.destroy({
      where: {
        supplier_id: supplierId.id,
      },
    });

    // Create new supplier_site records
    for (let key in payloadSupplierSite) {
      await db.SUPPLIER_SITE.create(payloadSupplierSite[key]);
    }

    // Other code if needed
    return successResponse(req, res, {
      message: "Success update data Supplier",
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    return errorResponse(req, res, "An error occurred");
  }
};

export const PPICSupplierDelete = async (req, res) => {
  const { supplier_id } = req.params;

  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }
    const checkSupplierId = await db.SUPPLIERS.findOne({
      where: {
        supplier_id,
      },
    });
    if (!checkSupplierId) {
      return errorResponse(req, res, "Supplier ID is not exist");
    }

    const payloadDeletedAt = { deleted_at: new Date(), deleted_by_id: userId };

    await db.SUPPLIERS.update(payloadDeletedAt, {
      where: {
        supplier_id,
      },
    });

    //delete supplier_site data by supplier_id

    await db.SUPPLIER_SITE.update(payloadDeletedAt, {
      where: {
        supplier_id: checkSupplierId.id,
      },
    });

    return successResponse(req, res, "Success delete data Supplier");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICSupplierHistory = async (req, res) => {
  const supplier_id = req.params.supplier_id;

  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }
    const supplierId = await db.SUPPLIERS.findOne({
      attributes: ["id"],
      where: {
        deleted_at: null,
        supplier_id,
      },
    });

    let supplierInfoData;

    let supplierPerId = await db.SUPPLIERS.findOne({
      attributes: [
        "id",
        "supplier_id",
        "name",
        "created_at",
        "updated_at",
        "updated_by_id",
      ],
      where: {
        id: supplierId.id,
      },
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["name", "created_at"],
        },
      ],
    });

    const supplierHistory = await history(db, supplierPerId.id);

    if (supplierPerId == null) {
    } else {
      supplierPerId.dataValues.price_avg =
        supplierHistory[0]?.price_avg == null
          ? 0
          : Number(supplierHistory[0].price_avg).toFixed(2) + "";

      supplierPerId.dataValues.total_trn =
        supplierHistory[0]?.total_trn == null
          ? 0
          : supplierHistory[0].total_trn;

      supplierPerId.dataValues.count_otif =
        supplierHistory[0]?.count_otif == null
          ? 0
          : supplierHistory[0].count_otif;

      supplierPerId.dataValues.count_not_otif =
        supplierHistory[0]?.total_trn - supplierHistory[0]?.count_otif;

      supplierPerId.dataValues.otif_percentage =
        (
          (supplierHistory[0]?.total_trn / supplierHistory[0]?.count_otif) *
          100
        ).toFixed(2) + "";

      supplierPerId.dataValues.recent_transactions = [];

      supplierInfoData = supplierPerId.dataValues;
    }
    const idSupplier = supplierPerId.id;
    const transactions = await db.trns.findAndCountAll({
      attributes: [
        "id",
        "datetime",
        "delivered_datetime",
        "handover_date",
        "is_otif",
      ],
      include: [
        {
          model: db.OFFERS,
          as: "offer",
          attributes: {
            include: [
              ["risk_mgmt_price_recommendation", "risk_mgmt_price_rec"],
            ],
            exclude: ["risk_mgmt_price_recommendation"],
          },
          where: {
            supplier_id: idSupplier,
            [Op.not]: [{ transaction_id: null }],
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
        },
      ],
      order: [["datetime", "DESC"]],
    });
    for (let key in transactions.rows) {
      if (transactions.rows[key].dataValues.offer == null) {
        continue;
      }
      supplierPerId.dataValues.recent_transactions.push(
        transactions.rows[key].dataValues
      );
      supplierPerId.dataValues.recent_transactions[
        key
      ].offer.dataValues.price_final =
        supplierPerId.dataValues.recent_transactions[
          key
        ].offer.dataValues.price_final.toFixed(2);
      supplierPerId.dataValues.recent_transactions[key].offer.dataValues.price =
        supplierPerId.dataValues.recent_transactions[
          key
        ].offer.dataValues.price.toFixed(2);
    }

    return successResponse(req, res, supplierInfoData);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICSupplierHistoryAll = async (req, res) => {
  const { page_number, page_size } = req.query;
  const offset = (page_number - 1) * page_size;

  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }
    const suppliersIds = await db.SUPPLIERS.findAndCountAll({
      attributes: ["id", "deleted_at"],
      offset: offset,
      limit: page_size,
      where: { deleted_at: null },
    });

    let supplierArray = [];

    for (let id in suppliersIds.rows) {
      let supplierPerId = await db.SUPPLIERS.findOne({
        attributes: [
          "id",
          "supplier_id",
          "name",
          "created_at",
          "updated_at",
          "updated_by_id",
        ],
        where: {
          id: suppliersIds.rows[id].dataValues.id,
        },
        include: [
          {
            model: db.USERS,
            as: "crtd_by",
            attributes: ["name", "created_at"],
          },
        ],

        order: [["id", "ASC"]],
      });
      const supplierHistory = await history(
        db,
        suppliersIds.rows[id].dataValues.id
      );
      const idSupplier = supplierPerId.dataValues.id;
      const transactions = await db.trns.findAndCountAll({
        include: [
          {
            model: db.OFFERS,
            as: "offer",
            where: {
              supplier_id: idSupplier,
              [Op.not]: [{ transaction_id: null }],
            },
            attributes: {
              include: [
                ["risk_mgmt_price_recommendation", "risk_mgmt_price_rec"],
              ],
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
            ],
          },
        ],
        offset: (page_number - 1) * page_size,
        limit: page_size,
      });
      supplierPerId.dataValues.count_otif = 0;
      if (!supplierHistory) {
        supplierPerId.dataValues.price_avg = 0;
        supplierPerId.dataValues.total_trn = 0;
        supplierPerId.dataValues.count_otif = 0;
        supplierPerId.dataValues.count_not_otif = 0;
        supplierPerId.dataValues.otif_percentage = 0;
        supplierPerId.dataValues.recent_transactions = [];
        supplierArray.push(supplierPerId.dataValues);
      } else {
        supplierPerId.dataValues.price_avg = Number(
          supplierHistory[0].price_avg
        );

        for (let key in transactions.rows) {
          transactions.rows[key].is_otif
            ? supplierPerId.dataValues.count_otif++
            : supplierPerId.dataValues.count_otif;
        }

        //ini supplier data home
        supplierPerId.dataValues.total_trn = transactions.count;
        supplierPerId.dataValues.count_not_otif =
          supplierPerId.dataValues.total_trn -
          supplierPerId.dataValues.count_otif;
        supplierPerId.dataValues.otif_percentage = isNaN(
          (Number(supplierPerId.dataValues.count_otif) /
            Number(supplierPerId.dataValues.total_trn)) *
            100
        )
          ? 0
          : (
              (Number(supplierPerId.dataValues.count_otif) /
                Number(supplierPerId.dataValues.total_trn)) *
              100
            ).toFixed(2);
        supplierPerId.dataValues.recent_transactions = [];
        supplierArray.push(supplierPerId.dataValues);
      }

      for (let key in transactions.rows) {
        if (transactions.rows[key].dataValues.offer == null) {
          continue;
        }
        transactions.rows[key].dataValues.offer.dataValues.price_final =
          Number(
            transactions.rows[key].dataValues.offer.dataValues.price_final
          ).toFixed(2) ?? 0;
        transactions.rows[key].dataValues.offer.dataValues.price =
          Number(
            transactions.rows[key].dataValues.offer.dataValues.price
          ).toFixed(2) ?? 0;
        supplierPerId.dataValues.recent_transactions.push(
          transactions.rows[key].dataValues
        );
      }
    }

    return successResponse(req, res, {
      suppliers_history: supplierArray,
      total: suppliersIds.count,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const PPICSupplierTransactions = async (req, res) => {
  const supplier_id = req.params.supplier_id;
  const { page_number, page_size } = req.query;
  try {
    const userId = getUserID(req);
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }
    const dataSupplier = await db.SUPPLIERS.findOne({
      where: { supplier_id },
      include: [
        {
          model: db.USERS,
          as: "crtd_by",
          attributes: ["id", "name"],
        },
      ],
    });

    const idSupplier = dataSupplier.id;

    const transactions = await db.trns.findAndCountAll({
      include: [
        {
          model: db.OFFERS,
          as: "offer",
          attributes: {
            include: [
              ["risk_mgmt_price_recommendation", "risk_mgmt_price_rec"],
            ],
            exclude: ["risk_mgmt_price_recommendation"],
          },
          where: {
            supplier_id: idSupplier,
            [Op.not]: [{ transaction_id: null }],
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
        },
      ],
      order: [["datetime", "DESC"]],
      offset: (page_number - 1) * page_size,
      limit: page_size,
    });

    return successResponse(req, res, {
      supplier: dataSupplier,
      transactions: transactions.rows,
      total: transactions.count,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const testOPENQUERY = async (req, res) => {
  try {
    const runQuery = async () => {
      const queryWithSchema = `SELECT * FROM OPENQUERY (TESTDEV,'SELECT AP_SUPPLIERS.SEGMENT1 "Supplier Number",
      AP_SUPPLIERS.VENDOR_NAME "Supplier Name",
      AP_SUPPLIER_SITES_ALL.VENDOR_SITE_CODE "Vendor Site Code",
      HZ_CONTACT_POINTS.EMAIL_ADDRESS "Email Address"
 FROM APPS.HZ_PARTY_SITES ,
      APPS.HZ_CONTACT_POINTS ,
      APPS.AP_SUPPLIERS ,
      APPS.AP_SUPPLIER_SITES_ALL 
WHERE     1 = 1
      AND HZ_CONTACT_POINTS.OWNER_TABLE_NAME = ''HZ_PARTY_SITES''
      AND HZ_PARTY_SITES.PARTY_ID = AP_SUPPLIERS.PARTY_ID
      AND HZ_CONTACT_POINTS.OWNER_TABLE_ID = HZ_PARTY_SITES.PARTY_SITE_ID
      AND HZ_CONTACT_POINTS.CONTACT_POINT_TYPE = ''EMAIL''
      AND HZ_CONTACT_POINTS.STATUS = ''A''
      AND AP_SUPPLIERS.VENDOR_ID = AP_SUPPLIER_SITES_ALL.VENDOR_ID
      AND AP_SUPPLIER_SITES_ALL.INACTIVE_DATE IS NULL
      AND AP_SUPPLIER_SITES_ALL.PARTY_SITE_ID = HZ_PARTY_SITES.PARTY_SITE_ID
ORDER BY AP_SUPPLIERS.SEGMENT1')`;

      return queryWithSchema;
    };

    const rawQuery = await runQuery();

    // Use try-catch for better error handling
    try {
      const results = await db.sequelize.query(rawQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });

      return successResponse(req, res, {
        rows: results,
        total: results.length,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(req, res, error.message);
    }
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

async function history(db, supplierId) {
  try {
    const supplierHistory = [];

    const sqlRows = await db.OFFERS.findAll({
      attributes: [
        "supplier_id",
        [
          Sequelize.literal(
            '(SUM("price_final" * "quantity") / SUM("quantity"))'
          ),
          "price_avg",
        ],
        [Sequelize.literal('(COUNT("transaction_id"))'), "total_trn"],
        [Sequelize.literal('(COUNT("id"))'), "count_otif"],
        "transaction_id",
      ],
      group: ["supplier_id", "transaction_id"],
      where: {
        supplier_id: supplierId,
        status: "approved",
        [Op.not]: [{ transaction_id: null }],
      },
    });

    if (sqlRows.length > 0) {
      for (const v of sqlRows) {
        let getTransactionIsOTIF = await db.trns.findOne({
          attributes: ["is_otif"],
          where: {
            id: v.dataValues.transaction_id,
          },
        });
        supplierHistory.push({
          price_avg:
            v?.dataValues.price_avg === null
              ? 0 + ""
              : v.dataValues.price_avg.toFixed(2) + "",
          total_trn: v.dataValues.total_trn,
          count_otif: getTransactionIsOTIF?.dataValues.is_otif ?? 0,
          count_not_otif:
            v.dataValues.total_trn - getTransactionIsOTIF?.dataValues.is_otif ??
            0,
          otif_percentage:
            (Number(getTransactionIsOTIF?.dataValues.is_otif ?? 0) /
              Number(v.dataValues.total_trn)) *
            100,
        });
      }

      return supplierHistory;
    } else {
      supplierHistory.push({
        price_avg: 0 + "",
        total_trn: 0,
        count_otif: "-",
        count_not_otif: "-",
        otif_percentage: "-",
      });

      return supplierHistory;
    }
  } catch (error) {
    throw error;
  }
}

// Example usage:
// history(db, supplierId)
//   .then((result) => {
//
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// const selectQuery = `SELECT AP_SUPPLIERS.Segment1 "Supplier Number",
//          AP_SUPPLIERS.vendor_name "Supplier Name",
//          AP_SUPPLIER_SITES_ALL.vendor_site_code "Vendor Site Code",
//          HZ_CONTACT_POINTS.EMAIL_ADDRESS "Email Address"
//     FROM APPS.HZ_PARTY_SITES,
//          APPS.HZ_CONTACT_POINTS,
//          APPS.AP_SUPPLIERS,
//          APPS.AP_SUPPLIER_SITES_ALL
//    WHERE     1 = 1
//          AND HZ_CONTACT_POINTS.OWNER_TABLE_NAME = ''HZ_PARTY_SITES''
//          AND HZ_PARTY_SITES.PARTY_ID = AP_SUPPLIERS.PARTY_ID
//          AND HZ_CONTACT_POINTS.OWNER_TABLE_ID = HZ_PARTY_SITES.PARTY_SITE_ID
//          AND HZ_CONTACT_POINTS.CONTACT_POINT_TYPE = ''EMAIL''
//          AND HZ_CONTACT_POINTS.STATUS = ''A''
//          AND AP_SUPPLIERS.VENDOR_ID = AP_SUPPLIER_SITES_ALL.VENDOR_ID
//          AND AP_SUPPLIER_SITES_ALL.inactive_date IS NULL
//          AND ap_supplier_sites_all.party_site_id = hz_party_sites.party_site_id
// ORDER BY ap_suppliers.segment1`

export const refreshOracle = async (transaction) => {
  const runQuery = async () => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (TESTDEV,'SELECT 
    AP_SUPPLIERS.VENDOR_ID "ref_id",
    AP_SUPPLIERS.SEGMENT1 "supplier_number",
            AP_SUPPLIERS.VENDOR_NAME "name",
            AP_SUPPLIER_SITES_ALL.VENDOR_SITE_CODE "vendor_site_code",
            HZ_CONTACT_POINTS.EMAIL_ADDRESS "email"
       FROM APPS.HZ_PARTY_SITES ,
            APPS.HZ_CONTACT_POINTS ,
            APPS.AP_SUPPLIERS ,
            APPS.AP_SUPPLIER_SITES_ALL 
      WHERE     1 = 1
            AND HZ_CONTACT_POINTS.OWNER_TABLE_NAME = ''HZ_PARTY_SITES''
            AND HZ_PARTY_SITES.PARTY_ID = AP_SUPPLIERS.PARTY_ID
            AND HZ_CONTACT_POINTS.OWNER_TABLE_ID = HZ_PARTY_SITES.PARTY_SITE_ID
            AND HZ_CONTACT_POINTS.CONTACT_POINT_TYPE = ''EMAIL''
            AND HZ_CONTACT_POINTS.STATUS = ''A''
            AND AP_SUPPLIERS.VENDOR_ID = AP_SUPPLIER_SITES_ALL.VENDOR_ID
            AND AP_SUPPLIER_SITES_ALL.INACTIVE_DATE IS NULL
            AND AP_SUPPLIER_SITES_ALL.PARTY_SITE_ID = HZ_PARTY_SITES.PARTY_SITE_ID
      ORDER BY AP_SUPPLIERS.SEGMENT1')`;

    return queryWithSchema;
  };

  const rawQuery = await runQuery();
  try {
    const oracleDataMerge = await db.sequelize.query(rawQuery, {
      type: Sequelize.QueryTypes.SELECT,
      transaction,
    });
    const oracleDataSplitted = oracleDataMerge.flatMap((supplier) => {
      const emailList =
        supplier.email.split(/;\s*|\s+/).map((email) => email.trim()) || [];
      return emailList.map((email) => ({
        ...supplier,
        email,
      }));
    });
    const MSSQLDataSplitted = await db.SUPPLIERS.findAll({
      raw: true,
      transaction,
    });
    const MSSQLDataEmailMerge = MSSQLDataSplitted.map((supplier) => {
      const SupplierEmailList = MSSQLDataSplitted.filter((sup) => {
        return sup.name === supplier.name;
      });
      if (SupplierEmailList.length > 0) {
        // Extract emails from the array of suppliers
        const emails = SupplierEmailList.map((sup) => sup.email.trim()).filter(
          Boolean
        );

        // Join the extracted emails with semicolon
        supplier.mergedEmail = emails.join(";");
      }
      return supplier; // Return the modified supplier
    });

    const toInsert = [];
    const toDelete = [];

    //first init
    if (MSSQLDataSplitted.length === 0 && MSSQLDataEmailMerge.length === 0) {
      for (let key in oracleDataSplitted) {
        await db.SUPPLIERS.create(oracleDataSplitted[key], { transaction });
      }
    } else {
      for (let key in oracleDataSplitted) {
        const existingSupplier = MSSQLDataSplitted.filter(
          (sqlSupplier) =>
            sqlSupplier.name === oracleDataSplitted[key].name &&
            sqlSupplier.email === oracleDataSplitted[key].email
        );
        if (!existingSupplier) {
          toInsert.push(oracleDataSplitted[key]);
        }
      }
      for (let key in MSSQLDataSplitted) {
        const existingSupplier = oracleDataSplitted.filter(
          (sqlSupplier) =>
            sqlSupplier.name === MSSQLDataSplitted[key].name &&
            sqlSupplier.email === MSSQLDataSplitted[key].email
        );
        if (!existingSupplier) {
          toDelete.push({ id: MSSQLDataSplitted[key].id });
        }
      }
    }

    for (let key in toInsert) {
      await db.SUPPLIERS.create(toInsert[key], { transaction });
    }
    for (let key in toDelete) {
      await db.SUPPLIERS.destroy({
        where: {
          id: toDelete[key].id,
        },
        transaction,
      });
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const areSuppliersEqual = (supplier1, supplier2) => {
  return (
    supplier1.ref_id === supplier2.ref_id &&
    supplier1.vendor_site_code === supplier2.vendor_site_code &&
    supplier1.supplier_number === supplier2.supplier_number &&
    supplier1.name === supplier2.name
  );
};

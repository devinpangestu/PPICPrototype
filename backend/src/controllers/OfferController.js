import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op, literal, Sequelize } from "sequelize";
import {
  parsingDateToString,
  parsingStringToDateEarly,
  parsingStringToDateLate,
  parseID,
} from "../utils/parsing.js";
import { toAPIStruct } from "../utils/apiStruct/offers.js";
import { constant } from "../constant/index.js";
import nsq from "nsqjs";
import oracledb from "oracledb";
import fs from "fs";
import { getUserID } from "../utils/auth.js";

export const OfferSummary = async (req, res) => {
  const { from_date, to_date } = req.query;
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const offers = await db.OFFERS.findAll({
      attributes: [
        "status",
        [Sequelize.fn("count", Sequelize.col("status")), "count"],
      ],
      where: {
        deleted_at: null,
        datetime: {
          [Op.between]: [
            parsingStringToDateEarly(from_date),
            parsingStringToDateLate(to_date),
          ],
        },
      },
      group: ["status"],
    });
    let summary = {};
    for (let prop in offers) {
      summary[offers[prop].dataValues.status] = offers[prop].dataValues.count;
    }

    return successResponse(req, res, summary);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferList = async (req, res) => {
  const { status, page_number, page_size, search, from_date, to_date } =
    req.query;
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const whereClause = {
      [Op.and]: [{ deleted_at: null }],
    };

    if (from_date && to_date) {
      whereClause[Op.and].push({
        datetime: {
          [Op.between]: [
            parsingStringToDateEarly(from_date),
            parsingStringToDateLate(to_date),
          ],
        },
      });
    }

    if (search) {
      whereClause[Op.and].push({
        [Op.or]: [
          { id: { [Op.like]: `%${search}%` } },
          { po_number: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (status) {
      whereClause[Op.and].push({ status });
    }

    const checkreject = await db.OFFERS.findAll({
      where: { status: "reject" },
    });

    const offers = await db.OFFERS.findAndCountAll({
      where: whereClause,
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
      ],
      order: [["datetime", "DESC"]],
      limit: page_size,
      offset: page_size * (page_number - 1),
    });

    await Promise.all(
      offers.rows.map(async (offer) => {
        const uniqueId = offer.dataValues.unique_id;
        const logisticOffers = await db.LOG_OFFERS.findAll({
          where: { commodity_offer_id: uniqueId },
          include: [
            // {
            //   model: db.LOG_TRANSPORTIRS,
            //   as: "trnsprtr",
            // },
            // {
            //   model: db.LOG_TRANSPORTIR_SHIP,
            //   as: "ship",
            // },
          ],
        });
        offer.dataValues.logistic_offers = logisticOffers.map(
          (logisticOffer) => {
            const { trnsprtr } = logisticOffer.dataValues;
            trnsprtr.types = JSON.parse(trnsprtr.types);

            return logisticOffer.dataValues;
          }
        );

        for (let key in offers.rows) {
          let rowOffer = offers.rows[key].dataValues;
          if (rowOffer.top_mgmt === null) {
            rowOffer.top_mgmt = {
              id: null,
              name: null,
              employee_id: null,
            };
          }

          if (rowOffer.risk_mgmt === null) {
            rowOffer.risk_mgmt = {
              id: null,
              name: null,
              employee_id: null,
            };
          }

          rowOffer.fulfillment = {
            is_fulfilled: null,
            documents_completed: null,
            loading_truck: null,
            ship: null,
            discharged_truck: null,
          };
          const getLogOfferLoadingQTY = await db.LOG_OFFERS.findAll({
            where: {
              commodity_offer_id: rowOffer.unique_id,
              type: "loading_truck",
            },
            attributes: [[literal('SUM("quantity")'), "total_quantity"]],
          });
          const getLogOfferShipQTY = await db.LOG_OFFERS.findAll({
            where: {
              commodity_offer_id: rowOffer.unique_id,
              type: "ship",
            },
            attributes: [[literal('SUM("quantity")'), "total_quantity"]],
          });
          const getLogOfferDischargeQTY = await db.LOG_OFFERS.findAll({
            where: {
              commodity_offer_id: rowOffer.unique_id,
              type: "discharged_truck",
            },
            attributes: [[literal('SUM("quantity")'), "total_quantity"]],
          });
          //check fulfillment by check the terms penyerahan

          if (rowOffer.terms_of_handover == "franco") {
            rowOffer.fulfillment.is_fulfilled = true;
          } else if (rowOffer.terms_of_handover == "cif") {
            if (
              getLogOfferShipQTY[0].dataValues.total_quantity ==
                rowOffer.quantity &&
              getLogOfferDischargeQTY[0].dataValues.total_quantity ==
                rowOffer.quantity
            ) {
              rowOffer.fulfillment.is_fulfilled = true;
            }
          } else if (rowOffer.terms_of_handover == "fob") {
            if (
              getLogOfferShipQTY[0].dataValues.total_quantity ==
                rowOffer.quantity &&
              getLogOfferDischargeQTY[0].dataValues.total_quantity ==
                rowOffer.quantity
            ) {
              rowOffer.fulfillment.is_fulfilled = true;
            }
          } else if (rowOffer.terms_of_handover == "loco_luar_pulau") {
            if (
              getLogOfferLoadingQTY[0].dataValues.total_quantity ==
                rowOffer.quantity &&
              getLogOfferShipQTY[0].dataValues.total_quantity ==
                rowOffer.quantity &&
              getLogOfferDischargeQTY[0].dataValues.total_quantity ==
                rowOffer.quantity
            ) {
              rowOffer.fulfillment.is_fulfilled = true;
            }
          }

          rowOffer.files = [];

          rowOffer.kpb_include = null;

          let genReportInternal = true;

          const [apiOffer, error] = await toAPIStruct(
            rowOffer,
            genReportInternal
          );
          offers.rows[key].kpb_exclude = apiOffer.kpb_exclude;
          offers.rows[key].kpb_include = apiOffer.kpb_include;
          offers.rows[key].price = Number(offers.rows[key].price.toFixed(2));
          offers.rows[key].price_final = Number(
            offers.rows[key].price_final.toFixed(2)
          );
        }
      })
    );
    return successResponse(req, res, {
      offers: offers.rows,
      total: offers.count,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferCreate = async (req, res) => {
  const {
    date,
    week,
    supplier_id,
    warehouse_id,
    commodity_id,
    handover_location_id,
    price_exclude,
    price,
    quantity,
    quality_ffa,
    quality_mi,
    handover_date_from,
    handover_date_to,
    eta_from,
    eta_to,
    terms_of_payment,
    terms_of_handover,
    terms_of_loading,
    dealer_notes,
    dealer_is_recommended,
    price_freight,
    price_freight_darat,
    price_freight_kapal,
    price_freight_bongkar,
    price_insurance,
    price_susut,
    price_cof,
    quality_dobi,
  } = req.body.rq_body;

  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const payload = {
      id: uniqueId(),
      status: constant.STATUS_PENDING_ASSESSMENT,
      date,
      week,
      supplier_id,
      warehouse_id,
      commodity_id,
      handover_location_id,
      price_exclude,
      price,
      price_final: price,
      quantity,
      quality_ffa,
      quality_mi,
      handover_date_from,
      handover_date_to,
      eta_from,
      eta_to,
      terms_of_payment,
      terms_of_handover,
      terms_of_loading,
      dealer_notes,
      dealer_is_recommended,
      price_freight,
      price_freight_darat,
      price_freight_kapal,
      price_freight_bongkar,
      price_insurance,
      price_susut,
      price_cof,
      quality_dobi,
      dealer_id: userId,
      from_draft: false,
      updated_at: new Date(),
      updated_by_id: userId,
    };

    const createdOffer = await db.OFFERS.create(payload);

    const currentyCreatedOffer = await db.OFFERS.findOne({
      where: { id: createdOffer.id },
    });

    if (terms_of_handover == "franco") {
      const payloadLogOffers = {
        commodity_offer_id: currentyCreatedOffer.unique_id,
        created_by_id: Number(userId),
        type: "franco",
        quantity: createdOffer.quantity,
        price: 0,
        loading_date_from: new Date(createdOffer.handover_date_from),
        loading_date_to: new Date(createdOffer.handover_date_to),
        status: "approved",
        logistic_offer_id: uniqueId(),
        transportir_id: 203, //FRANCO
        eta_from: new Date(createdOffer.handover_date_from),
        eta_to: new Date(createdOffer.handover_date_to),
        created_at: new Date(),
        updated_at: new Date(),
        release_num: 1,
      };

      await db.LOG_OFFERS.create(payloadLogOffers);
    }

    return successResponse(req, res, "Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferCreateFromDraft = async (req, res) => {
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const oldOffer = await db.OFFERS.findOne({
      where: { id: req.body.offer_id },
    });

    if (!oldOffer) {
      return errorResponse(req, res, "Offer not found");
    }

    const insertData = await db.OFFERS.create({
      ...oldOffer.dataValues,
      id: uniqueId(),
      datetime: new Date(),
      dealer_id: userId, //later diganti
      dealer_action_time: new Date(),
      status: constant.STATUS_PENDING_ASSESSMENT,
      from_draft: true,
      have_logistic: true,
      created_by_id: userId, //later diganti
    });
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferGet = async (req, res) => {
  const offer_id = req.params.offer_id;
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const whereClause = { [Op.or]: [] };
    if (offer_id.length < 10) {
      whereClause[Op.or].push({ unique_id: offer_id });
    } else {
      whereClause[Op.or].push({ id: offer_id });
    }

    const offer = await db.OFFERS.findOne({
      where: whereClause,
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

    if (!offer) {
      return errorResponse(req, res, "Offer not found");
    }

    const uniqueId = await offer.unique_id;

    const logisticOffers = await db.LOG_OFFERS.findAll({
      where: { commodity_offer_id: uniqueId },
    });

    const logistic_offers = [];
    if (logisticOffers.length === 0) {
      offer.logistic_offers = [];
    } else {
      for (let key in logisticOffers) {
        const logisticOffer = await db.LOG_OFFERS.findOne({
          where: { id: logisticOffers[key].id },
          include: [
            // {
            //   model: db.LOG_TRANSPORTIRS,
            //   as: "trnsprtr",
            // },
            // {
            //   model: db.LOG_TRANSPORTIR_SHIP,
            //   as: "ship",
            // },
          ],
        });
        logisticOffer.trnsprtr.types = JSON.parse(logisticOffer.trnsprtr.types);
        logistic_offers.push(logisticOffer.dataValues);
      }
      offer.logistic_offers = logistic_offers;

      offer.fulfillment = {
        is_fulfilled: null,
        documents_completed: null,
        loading_truck: null,
        ship: null,
        discharged_truck: null,
      };

      offer.files = [];

      offer.kpb_include = null;
      if (offer.top_mgmt == null) {
        offer.top_mgmt = {
          id: 0,
          name: "ghost",
          employee_id: "ghost",
        };
      }
      if (offer.risk_mgmt == null) {
        offer.risk_mgmt = {
          id: 0,
          name: "ghost",
          employee_id: "ghost",
        };
      }
      let genReportInternal = true;
      const [apiOffer, error] = await toAPIStruct(
        offer.dataValues,
        genReportInternal
      );
      offer.kpb_exclude = apiOffer.kpb_exclude;
      offer.kpb_include = apiOffer.kpb_include;
    }
    return successResponse(req, res, offer);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferCreateContractNumber = async (req, res) => {
  const offer_id = req.params.offer_id;
  const { contract_number } = req.body.rq_body;
  const userId = getUserID(req);

  const ORA_SCHEMA = "APPS";
  const ORA_PKG = "zzz_bpapo_pkg#";
  const libPath = process.env.LD_LIBRARY_PATH;
  try {
    if (!userId) {
      return errorResponse(req, res, "User not authorized");
    }

    const offer = await db.OFFERS.findOne({
      where: { id: offer_id },
    });

    if (!offer) {
      return errorResponse(req, res, "Offer not found");
    }

    if (offer.status !== "approved") {
      return errorResponse(req, res, "Offer not in approved status");
    }

    await db.OFFERS.update(
      {
        contract_number,
        updated_at: new Date(),
        updated_by_id: userId, //later diganti
      },
      {
        where: { id: offer_id },
      }
    );
    //change the description of bpapo_header_id

    let connection = await oracledb.getConnection({
      user: process.env.NODE_ORACLEDB_USER,
      password: process.env.NODE_ORACLEDB_PASSWORD,
      connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING,
    });
    const plsql = ` DECLARE
    v_full_text VARCHAR2(100) := 'SomeTextA Substring1 TextToReplace Substring2 SomeTextA';
    v_substring1 VARCHAR2(10) := 'Substring1';
    v_substring2 VARCHAR2(10) := 'Substring2';
    v_result VARCHAR2(50);
BEGIN
    APPS.zzz_bpapo_pkg#.p3_update_kontrak (:po_number, :contract_number, :v_result);
    DBMS_OUTPUT.PUT_LINE('Result: ' || :v_result);
    DBMS_OUTPUT.PUT_LINE('-KONTRAK NO.  ;FOB Bengkulu, FFA 5%, M+I 5%, ok');
END;`;

    const binds = {
      po_number: {
        val: offer.po_number,
        dir: oracledb.BIND_IN,
        type: oracledb.STRING,
      },
      contract_number: {
        val: contract_number,
        dir: oracledb.BIND_IN,
        type: oracledb.STRING,
      },
      v_result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
    };

    const result = await connection.execute(plsql, binds);

    return successResponse(req, res, "Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferEdit = async (req, res) => {
  const offer_id = req.params.offer_id;
  const userId = getUserID(req);
  const {
    date,
    week,
    supplier_id,
    warehouse_id,
    commodity_id,
    handover_location_id,
    price_exclude,
    price,
    quantity,
    quality_ffa,
    quality_mi,
    handover_date_from,
    handover_date_to,
    eta_from,
    eta_to,
    terms_of_payment,
    terms_of_handover,
    terms_of_loading,
    dealer_notes,
    dealer_is_recommended,
    price_freight,
    price_freight_darat,
    price_freight_kapal,
    price_freight_bongkar,
    price_insurance,
    price_susut,
    price_cof,
    quality_dobi,
  } = req.body.rq_body;

  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }

    const payload = {
      status: constant.STATUS_PENDING_ASSESSMENT,
      date,
      week,
      supplier_id,
      warehouse_id,
      commodity_id,
      handover_location_id,
      price_exclude,
      price,
      price_final: price,
      quantity,
      quality_ffa,
      quality_mi,
      handover_date_from,
      handover_date_to,
      eta_from,
      eta_to,
      terms_of_payment,
      terms_of_handover,
      terms_of_loading,
      dealer_notes,
      dealer_is_recommended,
      price_freight,
      price_freight_darat,
      price_freight_kapal,
      price_freight_bongkar,
      price_insurance,
      price_susut,
      price_cof,
      quality_dobi,
      dealer_id: userId,
      risk_mgmt_price_recommendation: null,
      risk_mgmt_action_time: null,
      risk_mgmt_id: null,
      risk_mgmt_notes: null,
      risk_mgmt_is_recommended: null,
      from_draft: false,
      updated_at: new Date(),
      updated_by_id: userId,
    };
    //perbaiki dealer id dan created by id nanti <-20/9/2023
    const insertData = await db.OFFERS.update(payload, {
      where: { id: offer_id },
    });

    return successResponse(req, res, "sukses edit offer ");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferAssess = async (req, res) => {
  const { notes, is_recommended, price_recommendation } = req.body.rq_body;
  const offer_id = req.params.offer_id;
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const offer = await db.OFFERS.findOne({
      where: { id: offer_id },
    });

    if (!offer) {
      return errorResponse(req, res, "Offer not found");
    }

    if (offer.status !== constant.STATUS_PENDING_ASSESSMENT) {
      return errorResponse(req, res, "Offer not in pending assessment status");
    }

    const updateData = await db.OFFERS.update(
      {
        status: constant.STATUS_PENDING_APPROVAL,
        risk_mgmt_price_recommendation: price_recommendation,
        risk_mgmt_action_time: new Date(), //later diganti
        risk_mgmt_id: userId,
        risk_mgmt_notes: notes,
        risk_mgmt_is_recommended: is_recommended,
      },
      {
        where: { id: offer_id },
      }
    );

    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferQueueforPOCreation = async (req, res) => {
  const offer_id = req.params.offer_id;

  try {
    const userId = getUserID(req);

    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const offer = await db.OFFERS.findOne({
      where: { id: offer_id },
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

    if (!offer) {
      return errorResponse(req, res, "Offer not found");
    }

    if (offer.status !== constant.STATUS_APPROVE) {
      return errorResponse(req, res, "Offer not in approved status");
    }

    const updatedFields = {
      queue_for_po_creation: true,
      updated_at: new Date(),
    };

    const updateData = await db.OFFERS.update(updatedFields, {
      where: { id: offer_id },
    });

    const err = await publishOfferApproved(offer);
    if (err !== null) {
      return errorResponse(req, res, err);
    }

    return successResponse(req, res, `${offer_id} is queued for PO creation`);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferNeedActionMinDate = async (req, res) => {
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const minDatetime = await db.OFFERS.min("datetime", {
      where: {
        deleted_at: null,
        status: [
          constant.STATUS_PENDING_ASSESSMENT,
          constant.STATUS_PENDING_APPROVAL,
          constant.STATUS_PENDING_BID_RESPONSE,
        ],
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

export const OfferDecide = async (req, res) => {
  const offer_id = req.params.offer_id;
  const { decision, bid_price, notes } = req.body.rq_body;
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const offer = await db.OFFERS.findOne({
      where: { id: offer_id },
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

    if (!offer) {
      return errorResponse(req, res, "Offer not found");
    }

    if (
      decision == constant.DECISION_APPROVE ||
      decision == constant.DECISION_REJECT
    ) {
      if (offer.dealer_fixed_price != null) {
        offer.price_final = offer.dealer_fixed_price;
      }
      if (notes != null) {
        offer.top_mgmt_notes = notes;
      }
    }

    switch (decision) {
      case constant.DECISION_APPROVE:
        const trnID = await createTransaction(offer);
        offer.status = "approved";
        offer.transaction_id = trnID;
        break;
      case constant.DECISION_REJECT:
        offer.status = constant.STATUS_REJECTED;
        break;
      case constant.DECISION_BID:
        if (bid_price >= offer.price_include) {
          return errorResponse(
            req,
            res,
            "Bid price must be less than offer price"
          );
        }

        offer.top_mgmt_bid_price = bid_price;
        offer.status = constant.STATUS_PENDING_BID_RESPONSE;

        if (notes != null || notes != undefined) {
          offer.top_mgmt_bid_notes = notes;
        }
        offer.top_mgmt_bid_time = new Date();
        break;
    }

    offer.top_mgmt_action_time = new Date();
    offer.updated_by_id = 1; //later diganti

    const payload = {
      status: offer.status,
      price_final: offer.price,
      transaction_id: offer.transaction_id,
      top_mgmt_bid_price: offer.top_mgmt_bid_price,
      top_mgmt_bid_notes: offer.top_mgmt_bid_notes,
      top_mgmt_bid_time: offer.top_mgmt_bid_time,
      top_mgmt_action_time: offer.top_mgmt_action_time,
      top_mgmt_notes: offer.top_mgmt_notes,
      top_mgmt_id: userId,
      updated_at: new Date(),
      updated_by_id: userId,
    };

    await db.OFFERS.update(payload, {
      where: { id: offer_id },
    });

    if (decision == constant.DECISION_APPROVE) {
      const err = await publishOfferApproved(offer);
      if (err !== null) {
        return errorResponse(req, res, err);
      }
    }

    return successResponse(req, res, "Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferAcceptBid = async (req, res) => {
  const offer_id = req.params.offer_id;
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const offer = await db.OFFERS.findOne({
      where: { id: offer_id },
    });

    if (!offer) {
      return errorResponse(req, res, "Offer not found");
    }

    if (offer.status !== constant.STATUS_PENDING_BID_RESPONSE) {
      return errorResponse(
        req,
        res,
        "Offer not in pending bid response status"
      );
    }

    const trnID = await createTransaction(offer);

    const payload = {
      transaction_id: trnID,
      status: "approved",
      price_final: offer.top_mgmt_bid_price,
      dealer_action_time: new Date(),
      updated_by_id: userId,
    };
    await db.OFFERS.update(payload, {
      where: { id: offer_id },
    });

    //create report ?
    return successResponse(req, res, "Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferRejectBid = async (req, res) => {
  const offer_id = req.params.offer_id;
  const { fixed_price } = req.body.rq_body;
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const offerValidate = await db.OFFERS.findOne({
      where: { id: offer_id },
    });

    if (!offerValidate) {
      return errorResponse(req, res, "Offer not found");
    }

    if (fixed_price <= offerValidate.top_mgmt_bid_price) {
      return errorResponse(
        req,
        res,
        "Fixed price must be greater than bid price"
      );
    }

    if (fixed_price >= offerValidate.price_include) {
      return errorResponse(
        req,
        res,
        "Fixed price must be less than offer price"
      );
    }

    if (offerValidate.status !== constant.STATUS_PENDING_BID_RESPONSE) {
      return errorResponse(
        req,
        res,
        "Offer not in pending bid response status"
      );
    }

    const updateData = await db.OFFERS.update(
      {
        status: constant.STATUS_PENDING_APPROVAL,
        dealer_fixed_price: fixed_price,
        dealer_action_time: new Date(),
        updated_at: new Date(),
        updated_by_id: userId, //later diganti
      },
      {
        where: { id: offer_id },
      }
    );

    return successResponse(req, res, "Success");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const OfferDelete = async (req, res) => {
  const offer_id = req.params.offer_id;
  const userId = getUserID(req);
  try {
    if (!userId) {
      return errorResponse(
        req,
        res,
        "User belum terautentikasi, silahkan login kembali"
      );
    }
    const offer = await db.OFFERS.findOne({
      where: { id: offer_id },
    });

    if (!offer) {
      return errorResponse(req, res, "Offer not found");
    }

    const updateData = await db.OFFERS.update(
      {
        deleted_at: new Date(),
        deleted_by_id: userId, //later diganti
      },

      {
        where: { id: offer_id },
      }
    );

    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

const createTransaction = async (offer) => {
  const created_at = offer.datetime;
  if (created_at == null) {
    offer.datetime = new Date();
  }
  const trnID = uniqueId();
  await db.trns.create({
    id: trnID,
    datetime: created_at,
    handover_date: offer.handover_date_to,
  });

  return trnID;
};

const publishOfferApproved = async (offer) => {
  const tNow = new Date();
  const dateNow = tNow.toISOString().split("T")[0];
  const timeNow = tNow.toISOString().split("T")[1].split(".")[0];
  let fPriceExclude = offer.price_exclude?.toFixed(2);
  let fPriceFinal = offer.price_final?.toFixed(2);
  let fFFA = offer.quality_ffa;
  let fMI = offer.quality_mi;
  let termsOfHandoverPO =
    constant.TERMS_OF_HANDOVER_TO_PO_MAP[offer.terms_of_handover];
  let desc = `-KONTRAK NO. ;${termsOfHandoverPO} ${offer.hOver_Loc.name}, FFA ${fFFA}%, M+I ${fMI}%, ${offer.terms_of_payment}`;

  let msg = {
    offer_id: offer.id,
    vendor_num: offer.spplr.supplier_id,
    vendor_site_num: offer.spplr.site_id,
    ship_to: offer.whs.warehouse_id,
    bill_to: offer.whs.warehouse_id,
    terms: constant.TERMS_OF_PAYMENT_ID, // currently always CBD
    description: desc,

    freight: termsOfHandoverPO,
    trader: offer.dealer.name,
    msp: fPriceFinal,

    item_code: offer.cmdty.commodity_id,
    item_desc: "", // leave empty to use oracle master default
    item_uom: "Kg", // currently always in Kg
    unit_price: fPriceExclude,
    quantity: parseInt(offer.quantity) * 1000,
  };

  let msgB = Buffer.from(JSON.stringify(msg));
  //publish to nsq
  const nsqPublish = new nsq.Writer("34.142.195.201", 4150); // Replace with your NSQD address
  nsqPublish.connect();
  const topicName = "pcpo-offer-approved-dev";
  nsqPublish.on("ready", () => {
    nsqPublish.publish(topicName, msgB, (err) => {
      if (err) {
        console.error("Failed to publish message:", err);
      } else {
      }
      nsqPublish.close();
    });
  });

  return null;
};

const createReport = async (offer) => {};

import { CronJob } from "cron";
import axios from "axios";
import db from "../models/index.js";
import { Op, Sequelize, literal, QueryTypes } from "sequelize";
import env from "../utils/validateEnv.js";
import { refreshOracle } from "../controllers/PPICSupplierController.js";
import { isNull } from "mathjs";
import sendEmailNotificationScheduleDebt from "../utils/emailTemplate/sendEmailNotificationScheduleDebt.js";
import moment from "moment";
import { constant } from "../constant/index.js";
// import msmq from "updated-node-msmq";

export const dailyJobSupplierValidityCheck = () => {
  new CronJob(
    "0 0 23 * * *",
    //0-59sec(optional) 0-59min 0-23hour 1-31daymonth 1-12month 0-7dayweek
    async () => {
      const tNow = new Date();
      const dateNow = tNow.toISOString().split("T")[0];
      const timeNow = tNow.toISOString().split("T")[1].split(".")[0];
      console.log(
        `[CRON DAILY REFRESH STATUS SUPPLIER] ${dateNow} ${timeNow} Start`
      );

      try {
        // Fetch data from your API
        const suppliers = await db.SUPPLIERS.findAll();
        if (suppliers.length === 0) {
          console.log(
            `[CRON DAILY REFRESH STATUS SUPPLIER] ${dateNow} ${timeNow} No suppliers to refresh for today.`
          );
        }
        let count = 0;
        for (let key in suppliers) {
          if (suppliers[key].dataValues.verified_status === false) {
            if (suppliers[key].dataValues.user_status === true) {
              await db.SUPPLIERS.update(
                { user_status: false },
                {
                  where: {
                    ref_id: suppliers[key].dataValues.ref_id,
                  },
                }
              );
              count++;
            }
          }
        }
        console.log(
          `[CRON DAILY REFRESH STATUS SUPPLIER] ${dateNow} ${timeNow} ===> ${count} suppliers status updated and ready to send email again.`
        );
      } catch (err) {
        console.log(err);
      }
    },
    null,
    true
  );
};

export const dailyJobSupplierRefreshSupplier = () => {
  new CronJob(
    "0 5 23 * * *",
    //0-59sec(optional) 0-59min 0-23hour 1-31daymonth 1-12month 0-7dayweek
    async () => {
      const tNow = new Date();
      const dateNow = tNow.toISOString().split("T")[0];
      const timeNow = tNow.toISOString().split("T")[1].split(".")[0];
      console.log(
        `[CRON DAILY REFRESH SUPPLIER DATA] ${dateNow} ${timeNow} START`
      );
      const transaction = await db.sequelize.transaction();
      try {
        // Fetch data from your API
        const err = await refreshOracle(transaction);
        if (!err) {
          await transaction.rollback();
          console.log(err);
        }
        console.log(
          `[CRON DAILY REFRESH SUPPLIER DATA] ${dateNow} ${timeNow} SUCCESSFULY REFRESH SUPPLIER DATA.`
        );
        await transaction.commit();
      } catch (err) {
        console.log(err);
      }
    },
    null,
    true
  );
};
export const dailyJobSupplierRefreshSupplierUser = () => {
  new CronJob(
    "0 0 23 * * *",
    //0-59sec(optional) 0-59min 0-23hour 1-31daymonth 1-12month 0-7dayweek
    async () => {
      const tNow = new Date();
      const dateNow = tNow.toISOString().split("T")[0];
      const timeNow = tNow.toISOString().split("T")[1].split(".")[0];
      console.log(
        `[CRON DAILY REFRESH SUPPLIER DATA] ${dateNow} ${timeNow} START`
      );
      const transaction = await db.sequelize.transaction();
      try {
        // CHECK FOR USER THAT NOT LOGIN UNTIL MIDNIGHT
        const allUser = await db.USERS.findAll({
          where: {
            deleted_at: null,
            password_changed_at: null,
            role_id: 4,
          },
          raw: true,
        });
        if (allUser.length === 0) {
          console.log(
            `[CRON DAILY REFRESH SUPPLIER DATA] ${dateNow} ${timeNow} No suppliers to refresh for today.`
          );
        }
        for (let key in allUser) {
          await db.USERS.destroy(
            {
              where: {
                id: allUser[key].id,
              },
            },
            { transaction }
          );
          //update supplier status
          await db.SUPPLIERS.update(
            { user_status: false },
            {
              where: {
                ref_id: allUser[key].supplier_id,
                email: allUser[key].email,
              },
            },
            { transaction }
          );
        }

        //CHECK FOR USER THAT ALREADY CHANGE PASSWORD TO GET VERIFIED STATUS
        const allUserChangedPassword = await db.USERS.findAll({
          where: {
            deleted_at: null,
            password_changed_at: { [Op.ne]: null },
            role_id: 4,
          },
          include: [
            {
              model: db.SUPPLIERS,
              as: "from_supplier",
              where: {
                user_status: true,
                verified_status: false,
              },
            },
          ],
          raw: true,
        });

        if (allUserChangedPassword.length === 0) {
          console.log(
            `[CRON DAILY REFRESH SUPPLIER DATA] ${dateNow} ${timeNow} No suppliers Account to refresh for today.`
          );
        }

        for (let key in allUserChangedPassword) {
          await db.SUPPLIERS.update(
            { verified_status: true },
            {
              where: {
                user_status: true,
                ref_id: allUserChangedPassword[key].supplier_id,
                email: allUserChangedPassword[key].email,
              },
            },
            { transaction }
          );
        }

        console.log(
          `[CRON DAILY REFRESH SUPPLIER DATA] ${dateNow} ${timeNow} SUCCESSFULY CLEAN USER DATA.`
        );

        await transaction.commit();
      } catch (err) {
        console.log(err);
      }
    },
    null,
    true
  );
};

export const dailyJobScheduleCheckTodayDeliveryDateAndOutstanding = () => {
  new CronJob(
    "0 0 23 * * *",
    //0-59sec(optional) 0-59min 0-23hour 1-31daymonth 1-12month 0-7dayweek
    async () => {
      const tNow = new Date();
      const dateNow = tNow.toISOString().split("T")[0];
      const timeNow = tNow.toISOString().split("T")[1].split(".")[0];
      console.log(
        `[CRON DAILY CHECKING SCHEDULE DEBT] ${dateNow} ${timeNow} Start`
      );

      try {
        // Fetch data from DB
        const offers = await db.OFFERS.findAll({
          raw: true,
          where: {
            deleted_at: null,
            flag_status: "X",
            est_delivery: { [Op.lte]: new Date() },
            po_outs: { [Op.ne]: 0 },
          },
        });

        if (offers.length === 0) {
          console.log(
            `[CRON DAILY CHECKING SCHEDULE DEBT] ${dateNow} ${timeNow} No Schedule debt.`
          );
        }
        const generateSentences = (offer) => {
          let sentences = `${moment().format(
            "DD-MM-YYYY"
          )} List jadwal hutang kirim :<br/>`;
          for (let i = 0; i < offer.length; i++) {
            const scheduleSentence = `- ${offer[i].po_number} untuk barang ${offer[i].sku_name} dengan outstanding quantity ${offer[i].po_outs}`;
            sentences += scheduleSentence + "<br/>";
            // You can add more conditions or concatenate more data as needed
          }
          return sentences;
        };

        await sendEmailNotificationScheduleDebt(
          `${offers.length} jadwal masuk status hutang kirim`,
          generateSentences(offers)
        );

        // for (let key in offers) {
        //   if (offers[key].dataValues.verified_status === false) {
        //     if (offers[key].dataValues.user_status === true) {
        //       await db.SUPPLIERS.update(
        //         { user_status: false },
        //         {
        //           where: {
        //             ref_id: offers[key].dataValues.ref_id,
        //           },
        //         }
        //       );
        //       count++;
        //     }
        //   }
        // }
        console.log(
          `[CRON DAILY CHECKING SCHEDULE DEBT] ${dateNow} ${timeNow} ===> email SENT to PPIC`
        );
      } catch (err) {
        console.log(err);
      }
    },
    null,
    true
  );
};

export const dailyJobUpdatePOOutstanding = () => {
  new CronJob(
    "0 0 23 * * *",
    //0-59sec(optional) 0-59min 0-23hour 1-31daymonth 1-12month 0-7dayweek
    async () => {
      const tNow = new Date();
      const dateNow = tNow.toISOString().split("T")[0];
      const timeNow = tNow.toISOString().split("T")[1].split(".")[0];
      console.log(
        `[CRON DAILY UPDATING PO OUTSTANDING 6 MONTH BEFORE] ${moment().format(
          "DD-MMM-YYYY HH:mm:ss"
        )} Start`
      );
      const dbTransaction = await db.sequelize.transaction();
      try {
        const whereClause = {
          submission_date: {
            [Op.between]: [
              moment()
                .subtract(6, "months")
                .startOf("month")
                .format(constant.FORMAT_API_DATE),
              moment().format(constant.FORMAT_API_DATE),
            ],
          },
          deleted_at: null,
        };
        const offers = await db.OFFERS.findAll({
          where: whereClause,
          attributes: ["po_number", "sku_code"],
          raw: true,
          group: ["po_number", "sku_code"],
        });

        for (let key in offers) {
          const po_number = offers[key].po_number;
          const sku_code = offers[key].sku_code;

          if (po_number === "") {
            continue;
          } else {
            const [err, res] = await OpenQueryPOOuts(
              po_number,
              sku_code,
              dbTransaction
            );
            // console.log()

            const qtyOuts = res[0].QUANTITY_OUTSTANDING;
            // console.log()
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
                { dbTransaction }
              );
            }
          }
        }

        await dbTransaction.commit();
        console.log(
          `[CRON DAILY UPDATING PO OUTSTANDING 6 MONTH BEFORE] ${moment().format(
            "DD-MMM-YYYY HH:mm:ss"
          )} SUCCESS REFRESH PO OUTSTANDING`
        );
      } catch (error) {
        console.error(error);
      }
    },
    null,
    true
  );
};
const OpenQueryPOOuts = async (poNumber, skuCode, transaction) => {
  const getLineNumber = await OpenQueryGetLineNum(poNumber, skuCode);
  console.log(getLineNumber);
  const getPOOuts = (po) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (TESTDEV,'SELECT
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
    return [false, results];
  }
};
const OpenQueryGetLineNum = async (poNumber, skuCode, transaction) => {
  const skuSplit = skuCode.split(".");
  const getPODetails = (po, skucode) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (TESTDEV,'select aps.vendor_name, pha.segment1, pla.line_num, pla.quantity, 
    SUM(pda.quantity_ordered-pda.quantity_delivered-pda.quantity_cancelled) qty_outs,pla.line_num line_number, msi.description nama_sku
    from APPS.po_headers_all pha, APPS.po_lines_all pla, APPS.po_distributions_all pda,
    APPS.ap_suppliers aps, APPS.mtl_system_items msi
    where 1=1
    and pha.segment1 = ''${po}''
    and pha.po_header_id = pla.po_header_id
    and pla.po_line_id = pda.po_line_id
    and msi.segment1 = ''${skucode[0]}''
    and msi.segment2 = ''${skucode[1]}''
    and msi.segment3 = ''${skucode[2]}''
    and pha.vendor_id = aps.vendor_id
    and pla.item_id = msi.inventory_item_id
    and msi.organization_id = 101
    group by aps.vendor_Name, pha.segment1,
    pla.line_num, pla.quantity,
    (msi.segment1 || ''.'' || msi.segment2 || ''.'' ||msi.segment3), 
    msi.description')`;

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

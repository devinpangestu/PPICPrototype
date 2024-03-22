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

export const hourlyJobUpdatePOOutstanding = () => {
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
        const distinctOffers = [...new Set(offers)];

        for (let key in distinctOffers) {
          const po_number = distinctOffers[key].po_number;
          const sku_code = distinctOffers[key].sku_code;

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
                { transaction: dbTransaction }
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

export const hourlyJobUpdateColumnHistoryPOOuts = () => {
  new CronJob(
    "0 0 * * * *",
    //0-59sec(optional) 0-59min 0-23hour 1-31daymonth 1-12month 0-7dayweek
    async () => {
      console.log(
        `[CRON DAILY UPDATING COLUMN HISTORY PO OUTSTANDING 6 MONTH BEFORE] ${moment().format(
          "DD-MMM-YYYY HH:mm:ss"
        )} Start`
      );
      // const dbTransaction = await db.sequelize.transaction();
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
        const distinctOffers = [...new Set(offers)];

        for (let key in distinctOffers) {
          const po_number = distinctOffers[key].po_number;
          const sku_code = distinctOffers[key].sku_code;

          if (po_number === "") {
            continue;
          } else {
            const [err, res] = await OpenQueryGetLineNum(po_number, sku_code);
            // console.log()

            const qtyOuts = res[0].QTY_OUTS;
            console.log(qtyOuts);
            // console.log()
            if (qtyOuts == null) {
              continue;
            } else {
              const historyPOOuts = await db.OFFERS.findOne({
                where: {
                  po_number,
                  sku_code,
                },
                attributes: ["po_outs_history"],
                raw: true,
              });
              const poOutsHistory = JSON.parse(historyPOOuts.po_outs_history);
              if (!poOutsHistory) {
                await db.OFFERS.update(
                  {
                    po_outs_history: JSON.stringify([
                      {
                        po_outs: qtyOuts,
                        date_record: moment().format("YYYY-MM-DD"),
                      },
                    ]),
                  },
                  {
                    where: {
                      po_number,
                      sku_code,
                    },
                  }
                );
              } else {
                if (poOutsHistory.length > 0) {
                  const lastRecord = poOutsHistory[poOutsHistory.length - 1];
                  if (lastRecord.po_outs === qtyOuts) {
                    continue;
                  }
                }

                await db.OFFERS.update(
                  {
                    po_outs_history: JSON.stringify([
                      ...(poOutsHistory || []),
                      {
                        po_outs: qtyOuts,
                        date_record: moment().format("YYYY-MM-DD"),
                      },
                    ]),
                  },
                  {
                    where: {
                      po_number,
                      sku_code,
                    },
                  }
                );
              }
            }
          }
        }

        // await dbTransaction.commit();
        console.log(
          `[CRON DAILY UPDATING COLUMN HISTORY PO OUTSTANDING 6 MONTH BEFORE] ${moment().format(
            "DD-MMM-YYYY HH:mm:ss"
          )} SUCCESS REFRESH COLUMN HISTORY PO OUTSTANDING`
        );
      } catch (error) {
        console.error(error);
      }
    },
    null,
    true
  );
};

export const hourlyJobUpdateColumnChangesPOOuts = () => {
  new CronJob(
    "*/30 * * * * *",
    //0-59sec(optional) 0-59min 0-23hour 1-31daymonth 1-12month 0-7dayweek
    async () => {
      console.log(
        `[CRON DAILY UPDATING COLUMN CHANGES PO OUTSTANDING 6 MONTH BEFORE] ${moment().format(
          "DD-MMM-YYYY HH:mm:ss"
        )} Start`
      );
      // const dbTransaction = await db.sequelize.transaction();
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
          attributes: ["po_number", "sku_code", "po_outs_history"],
          raw: true,
          group: ["po_number", "sku_code", "po_outs_history"],
        });
        const distinctOffers = [...new Set(offers)];

        for (let key in distinctOffers) {
          const po_number = distinctOffers[key].po_number;
          const sku_code = distinctOffers[key].sku_code;
          const poOutsHistory = JSON.parse(distinctOffers[key].po_outs_history);

          if (!poOutsHistory) {
            continue;
          } else {
            if (po_number === "") {
              continue;
            } else {
              if (poOutsHistory.length === 0 || poOutsHistory.length === 1) {
                continue;
              }
              console.log(poOutsHistory);
              for (let key in poOutsHistory) {
                const poOuts = poOutsHistory[key].po_outs;
                const dateRecord = poOutsHistory[key].date_record;
              }
              // console.log()
              // if (qtyOuts == null) {
              //   continue;
              // } else {
              //   const historyPOOuts = await db.OFFERS.findOne({
              //     where: {
              //       po_number,
              //       sku_code,
              //     },
              //     attributes: ["po_outs_history"],
              //     raw: true,
              //   });
              //   const poOutsHistory = JSON.parse(historyPOOuts.po_outs_history);
              //   if (!poOutsHistory) {
              //     await db.OFFERS.update(
              //       {
              //         po_outs_history: JSON.stringify([
              //           {
              //             po_outs: qtyOuts,
              //             date_record: moment().format("YYYY-MM-DD"),
              //           },
              //         ]),
              //       },
              //       {
              //         where: {
              //           po_number,
              //           sku_code,
              //         },
              //       }
              //     );
              //   } else {
              //     if (poOutsHistory.length > 0) {
              //       const lastRecord = poOutsHistory[poOutsHistory.length - 1];
              //       if (lastRecord.po_outs === qtyOuts) {
              //         continue;
              //       }
              //     }

              //     await db.OFFERS.update(
              //       {
              //         po_outs_history: JSON.stringify([
              //           ...(poOutsHistory || []),
              //           {
              //             po_outs: qtyOuts,
              //             date_record: moment().format("YYYY-MM-DD"),
              //           },
              //         ]),
              //       },
              //       {
              //         where: {
              //           po_number,
              //           sku_code,
              //         },
              //       }
              //     );
              //   }
              // }
            }
          }
        }

        // await dbTransaction.commit();
        console.log(
          `[CRON DAILY UPDATING COLUMN HISTORY PO OUTSTANDING 6 MONTH BEFORE] ${moment().format(
            "DD-MMM-YYYY HH:mm:ss"
          )} SUCCESS REFRESH COLUMN HISTORY PO OUTSTANDING`
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

  const getPOOuts = (po) => {
    const queryWithSchema = `SELECT * FROM OPENQUERY (ORACLEPROD,'SELECT
    SUM(PO_DISTRIBUTIONS_ALL.QUANTITY_ORDERED - PO_DISTRIBUTIONS_ALL.QUANTITY_DELIVERED - PO_DISTRIBUTIONS_ALL.QUANTITY_CANCELLED) "QUANTITY_OUTSTANDING"
    FROM APPS.PO_HEADERS_ALL, APPS.PO_LINES_ALL, APPS.PO_DISTRIBUTIONS_ALL
    WHERE PO_HEADERS_ALL.SEGMENT1 = ''${po.replace(/[^a-zA-Z0-9 ]/g, "")}''
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

// [
//   { po_outs: 150000, date_record: "2021-08-05" },
//   { po_outs: 150000, date_record: "2021-08-06" },
//   { po_outs: 150000, date_record: "2021-08-07" },
//   { po_outs: 120467, date_record: "2021-08-08" },
//   { po_outs: 120467, date_record: "2021-08-09" },
//   { po_outs: 90635, date_record: "2021-08-10" },
//   { po_outs: 90635, date_record: "2021-08-11" },
//   { po_outs: 90635, date_record: "2021-08-12" },
//   { po_outs: 60925, date_record: "2021-08-13" },
//   { po_outs: 60925, date_record: "2021-08-14" },
//   { po_outs: 60925, date_record: "2021-08-15" },
//   { po_outs: 60925, date_record: "2021-08-16" },
//   { po_outs: 31225, date_record: "2021-08-17" },
//   { po_outs: 31225, date_record: "2021-08-18" },
//   { po_outs: 31225, date_record: "2021-08-19" },
//   { po_outs: 1845, date_record: "2021-08-20" },
//   { po_outs: 1845, date_record: "2021-08-21" },
//   { po_outs: 1845, date_record: "2021-08-22" },
// ];

// [
//   { po_outs: 150000, date_record: "2021-08-05" },
//   { po_outs: 120467, date_record: "2021-08-08" },jadwal 1 selesai tanggal 8/8 terpenuhi 29533 sisa 467
//   { po_outs: 90625, date_record: "2021-08-10" },jadwal 2 selesai tanggal 10/8 terpenuhi 29842 sisa 158
//   { po_outs: 60925, date_record: "2021-08-13" },jadwal 3 selesai tanggal 13/8 terpenuhi 29700 sisa 300
//   { po_outs: 31236, date_record: "2021-08-17" },jadwal 4 selesai tanggal 17/8 terpenuhi 29689 sisa 311
//   { po_outs: 1845, date_record: "2021-08-20" },jadwal 5 selesai tanggal 20/8 terpenuhi 29391 sisa 609
// ];

// [
//   { fulfilled: 29533, not_fulfilled: 467, date_record: "2021-08-08" },
//   { fulfilled: 29842, not_fulfilled: 158, date_record: "2021-08-10" },
//   { fulfilled: 29700, not_fulfilled: 300, date_record: "2021-08-13" },
//   { fulfilled: 29689, not_fulfilled: 311, date_record: "2021-08-17" },
//   { fulfilled: 29391, not_fulfilled: 609, date_record: "2021-08-20" },
// ];

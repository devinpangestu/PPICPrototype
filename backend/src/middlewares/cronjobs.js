import { CronJob } from "cron";
import axios from "axios";
import db from "../models/index.js";
import { Op } from "sequelize";
import env from "../utils/validateEnv.js";
import { refreshOracle } from "../controllers/PPICSupplierController.js";
import { isNull } from "mathjs";
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

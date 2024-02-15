import db from "../models/index.js";
import { successResponse, errorResponse, uniqueId } from "../helpers/index.js";
import { Op } from "sequelize";
import xl from "excel4node";
import { constant } from "../constant/index.js";
import path from "path";
import fs from "fs";
import { exportOfferData } from "../utils/export/export_offer.js";
import {
  exportTrnHist,
  exportTrnHistV2,
} from "../utils/export/export_history.js";
import {
  parsingStringToDateEarly,
  parsingStringToDateLate,
} from "../utils/parsing.js";
import { initStyles } from "../utils/excelConstructor/excelStyles.js";

export const ExportXLSX = async (req, res) => {
  const { export_type, from_date, to_date } = req.body.rq_body;
  try {
    if (
      new Date(parsingStringToDateEarly(from_date)).getTime() >
      new Date(parsingStringToDateLate(to_date)).getTime()
    ) {
      return errorResponse(
        req,
        res,
        "Tanggal akhir tidak boleh lebih kecil dari tanggal awal"
      );
    }

    // if (
    //   new Date(parsingStringToDateEarly(to_date)).getTime() >
    //   new Date().getTime()
    // ) {
    //   return errorResponse(
    //     req,
    //     res,
    //     "Tanggal akhir tidak boleh lebih besar dari tanggal hari ini"
    //   );
    // }

    const wb = new xl.Workbook({
      workbookView: {
        autoFilterDateGrouping: true,
      },
    });
    const styles = initStyles(wb);
    let ws;
    let ws2;
    let fNamePrefix = "";
    let fileName = "";
    let reportPath = "";
    let err;
    
    switch (export_type) {
      case constant.EXPORT_TYPE_OFFER:
        fNamePrefix = constant.FNAME_PREFIX_OFFER;
        ws = wb.addWorksheet(fNamePrefix, {
          sheetView: { zoomScale: 80 },
        });

        fileName = `${fNamePrefix}_${from_date}_${to_date}`;
        reportPath = "/offer";
        err = await exportOfferData(ws, styles, from_date, to_date);
        break;
      case constant.EXPORT_TYPE_TRN_HIST:
        fNamePrefix = constant.FNAME_PREFIX_TRN_HIST;
        ws = wb.addWorksheet(fNamePrefix, { sheetView: { zoomScale: 80 } });
        ws2 = wb.addWorksheet("Budget Freight", {
          sheetView: { zoomScale: 100 },
          sheetFormat: {
            baseColWidth: 7,
          },
        });
        fileName = `${fNamePrefix}_${from_date}_${to_date}`;
        reportPath = "/transaction-history";
        // err = await exportTrnHist(ws, ws2, styles, from_date, to_date);
        err = await exportTrnHistV2(ws, ws2, styles, from_date, to_date);

        break;
      // case constant.EXPORT_TYPE_SUPPLIER_TRN_HIS:
      //   fNamePrefix = constant.FNAME_PREFIX_SUPPLIER_TRN_HIS;
      //   ws = wb.addWorksheet(fNamePrefix,{ sheetView: { zoomScale: 80 }, });
      //   fileName = `${fNamePrefix}_${req.Body.ID}_${from_date}_${to_date}`;
      //   reportPath = "/supplier-transaction-history";
      //   err = exportSupplierTrnHist(ws, styles, from_date, to_date);
      //   break;
      // case constant.EXPORT_TYPE_PRICE:
      //   fNamePrefix = constant.FNAME_PREFIX_PRICE;
      //   ws = wb.addWorksheet(constant.EXPORT_SHEET_DALIAN,{ sheetView: { zoomScale: 80 }, });
      //   fileName = `${fNamePrefix}_${from_date}_${to_date}`;
      //   reportPath = "/price";
      //   err = exportPrice(ws, styles, from_date, to_date);
      //   break;
      default:
        break;
    }

    const fileNameWithExt = `${fileName}.xlsx`;
    const filePath = `src/bin/storages${reportPath}/${fileNameWithExt}`;
    const resURL = `${process.env.BASE_URL}/reports/data${reportPath}/${fileNameWithExt}`;

    //Opening a file for both reading and writing, throwing an exception if the file doesn't exist.

    try {
      // Check if the file is locked
      const isLocked = await isFileLocked(filePath);
      if (isLocked) {
        return errorResponse(
          req,
          res,
          "File is currently locked. Cannot write to it."
        );
      }

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      await wb.write(`${filePath}`);
      return successResponse(req, res, { url: resURL });
    } catch (error) {
      return errorResponse(req, res, error.message);
    }
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const ExportSupplierTrnHist = async (req, res) => {
  const { type, file_name } = req.params;

  try {
    const fileNameWithExt = `${file_name}`;
    const filePath = `src/bin/storages/${type}/${fileNameWithExt}`;
    res.download(filePath); // Trigger the download
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const isFileLocked = async (filePath) => {
  try {
    const fs2 = fs.promises
    const fileHandle = await fs2.open(filePath, "r+");
    await fileHandle.close(); // Close the file handle
    return false; // The file is not locked (can be written)
  } catch (err) {
    if (err.code === "EPIPE") {
      return true; // The file is locked
    }
    if (err.code === "ENOENT") {
      return false; // The file is locked
    }
    throw err; // Handle other errors
  }
};

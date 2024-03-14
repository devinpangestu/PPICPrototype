import express from "express";
import * as ExportController from "../../controllers/ExportController.js";

const router = express.Router();

router.get(
  "/reports/data/:type/:file_name",
  ExportController.DownloadExportExcelFile
);

export default router;

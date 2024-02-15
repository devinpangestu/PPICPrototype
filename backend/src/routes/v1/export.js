import express from "express";
import * as ExportController from "../../controllers/ExportController.js";

const router = express.Router();

router.post("/", ExportController.ExportXLSX);

export default router;

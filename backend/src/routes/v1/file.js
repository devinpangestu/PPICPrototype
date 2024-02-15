import express from "express";
import * as FileController from "../../controllers/FileController.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url.toString());

const __dirname = dirname(__filename);
const router = express.Router();

router.post("/upload/single", FileController.UploadSingle);
router.get("/:file_type/:type/:file_name", FileController.GetFile);

router.delete("/delete", FileController.FileDelete);

export default router;

import express from "express";
import * as PermissionController from "../../controllers/PermissionController.js";

const router = express.Router();

router.get("/permissions", PermissionController.PermissionGet);

export default router;

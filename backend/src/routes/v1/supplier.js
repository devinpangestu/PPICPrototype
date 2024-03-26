import express from "express";
import * as SupplierController from "../../controllers/SupplierController.js";
import { verifyTokenAndRole } from "../../middlewares/auth.js";
import { dynamicRateLimit } from "../../middlewares/requestHandling.js";
const router = express.Router();

router.get(
  "/",
  verifyTokenAndRole("supplier@view"),
  SupplierController.SupplierScheduleList
);
router.post(
  "/",
  dynamicRateLimit,
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleCreate
);
router.get(
  "/get-all-PO",
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleGetPOQtyAndDate
);
router.put(
  "/confirm",
  dynamicRateLimit,
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleConfirmSelectedData
);
router.put(
  "/confirm/:id",
  dynamicRateLimit,
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleConfirm
);
router.put(
  "/split-supplier/:id",
  dynamicRateLimit,
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleSplitSupplier
);
router.put(
  "/close-po/:id",
  dynamicRateLimit,
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleClosePOSupplier
);

router.get(
  "/:supplier_id",
  verifyTokenAndRole("supplier@view"),
  SupplierController.SupplierScheduleGet
);
router.put(
  "/complex-edit",
  dynamicRateLimit,
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleEdit
);

router.get(
  "/history",
  verifyTokenAndRole("supplier@view"),
  SupplierController.SupplierScheduleHistoryAll
);
router.get(
  "/history/:supplier_id",
  verifyTokenAndRole("supplier@view"),
  SupplierController.SupplierScheduleHistory
);
router.get(
  "/:supplier_id/transactions",
  verifyTokenAndRole("supplier@view"),
  SupplierController.SupplierScheduleTransactions
);

export default router;

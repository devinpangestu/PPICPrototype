import express from "express";
import * as SupplierController from "../../controllers/SupplierController.js";
import { verifyTokenAndRole } from "../../middlewares/auth.js";
const router = express.Router();

router.get(
  "/",
  verifyTokenAndRole("supplier@view"),
  SupplierController.SupplierScheduleList
);
router.post(
  "/",
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
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleConfirmSelectedData
);
router.put(
  "/confirm/:id",
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleConfirm
);
router.put(
  "/split-supplier/:id",
  verifyTokenAndRole("supplier@edit"),
  SupplierController.SupplierScheduleSplitSupplier
);

router.get(
  "/:supplier_id",
  verifyTokenAndRole("supplier@view"),
  SupplierController.SupplierScheduleGet
);
router.put(
  "/complex-edit",
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

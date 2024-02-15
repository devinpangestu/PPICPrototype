import express from "express";
import * as PPICSupplierController from "../../controllers/PPICSupplierController.js";
import { verifyTokenAndRole } from "../../middlewares/auth.js";
const router = express.Router();
router.get("/testOPENQUERY", PPICSupplierController.testOPENQUERY);
router.get("/", PPICSupplierController.PPICSupplierList);
router.post(
  "/",
  verifyTokenAndRole("ppic@create"),
  PPICSupplierController.PPICSupplierCreate
);
router.put(
  "/refresh-suppliers",
  PPICSupplierController.PPICSupplierRefreshOracle
);
router.post(
  "/:id/create-request",
  verifyTokenAndRole("ppic@create"),
  PPICSupplierController.PPICSupplierCreateUserAndSendEmail
);

router.get(
  "/:supplier_id",
  verifyTokenAndRole("ppic@view"),
  PPICSupplierController.PPICSupplierGet
);
router.put(
  "/:supplier_id",
  verifyTokenAndRole("supplier@edit"),
  PPICSupplierController.PPICSupplierEdit
);
router.delete(
  "/:supplier_id",
  verifyTokenAndRole("supplier@delete"),
  PPICSupplierController.PPICSupplierDelete
);

router.get("/history", PPICSupplierController.PPICSupplierHistoryAll);
router.get("/history/:supplier_id", PPICSupplierController.PPICSupplierHistory);
router.get(
  "/:supplier_id/transactions",
  PPICSupplierController.PPICSupplierTransactions
);

export default router;

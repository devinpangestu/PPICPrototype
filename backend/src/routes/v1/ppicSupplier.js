import express from "express";
import * as PPICSupplierController from "../../controllers/PPICSupplierController.js";
import { verifyTokenAndRole } from "../../middlewares/auth.js";
import { dynamicRateLimit } from "../../middlewares/requestHandling.js";

const router = express.Router();
router.get("/testOPENQUERY", PPICSupplierController.testOPENQUERY);
router.get("/", PPICSupplierController.PPICSupplierList);
router.post(
  "/",
  dynamicRateLimit,
  verifyTokenAndRole("ppic@create"),
  PPICSupplierController.PPICSupplierCreate
);
router.put(
  "/refresh-suppliers",
  dynamicRateLimit,
  PPICSupplierController.PPICSupplierRefreshOracle
);
router.post(
  "/:id/create-request",
  verifyTokenAndRole("ppic@create"),
  dynamicRateLimit,
  PPICSupplierController.PPICSupplierCreateUserAndSendEmail
);

router.get(
  "/:supplier_id",
  verifyTokenAndRole("ppic@view"),
  PPICSupplierController.PPICSupplierGet
);
router.put(
  "/:supplier_id",
  dynamicRateLimit,
  verifyTokenAndRole("supplier@edit"),
  PPICSupplierController.PPICSupplierEdit
);
router.delete(
  "/:supplier_id",
  dynamicRateLimit,
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

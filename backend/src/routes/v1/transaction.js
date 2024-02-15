import express from "express";
import * as TransactionController from "../../controllers/TransactionController.js";

const router = express.Router();

router.get("/po-number",TransactionController.TransactionPOList);
router.get("/po-number/:po_number", TransactionController.TransactionPOGet);
router.get("/", TransactionController.TransactionList);
router.get("/:transaction_id", TransactionController.TransactionGet);
router.put(
  "/:transaction_id/delivered",
  TransactionController.TransactionDelivered
);

export default router;

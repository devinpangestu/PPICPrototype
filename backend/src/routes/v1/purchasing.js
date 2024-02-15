import express from "express";
import * as PurchasingController from "../../controllers/PurchasingController.js";
import {verifyTokenAndRole} from "../../middlewares/auth.js";

const router = express.Router();

router.get(
  "/summary",
  verifyTokenAndRole("purchasing@view"),
  PurchasingController.PurchasingScheduleSummary
);
router.get(
  "/",
  verifyTokenAndRole("purchasing@view"),
  PurchasingController.PurchasingScheduleList
);
router.get(
  "/get-min-date",
  verifyTokenAndRole("purchasing@view"),
  PurchasingController.PurchasingScheduleNeedActionMinDate
);
router.post(
  "/",
  verifyTokenAndRole("purchasing@create"),
  PurchasingController.PurchasingScheduleCreate
);
router.put(
  "/",
  verifyTokenAndRole("purchasing@edit"),
  PurchasingController.PurchasingScheduleEdit
);
router.put(
  "/sendt-supplier",
  verifyTokenAndRole("purchasing@edit"),
  PurchasingController.PurchasingScheduleSendToSupplier
);
router.put(
  "/accept-split",
  verifyTokenAndRole("purchasing@edit"),
  PurchasingController.PurchasingScheduleAcceptSplitSupplier
);
router.put(
  "/reject-split",
  verifyTokenAndRole("purchasing@edit"),
  PurchasingController.PurchasingScheduleRejectSplitSupplier
);

router.put(
  "/accept-edit",
  verifyTokenAndRole("purchasing@edit"),
  PurchasingController.PurchasingScheduleAcceptEditSupplier
);
router.put(
  "/reject-edit",
  verifyTokenAndRole("purchasing@edit"),
  PurchasingController.PurchasingScheduleRejectEditSupplier
);
router.get(
  "/:id",
  verifyTokenAndRole("purchasing@view"),
  PurchasingController.PurchasingScheduleGet
);

router.put(
  "/retur/:id",
  verifyTokenAndRole("purchasing@edit"),
  PurchasingController.PurchasingScheduleRetur
);
router.put(
  "/split-purchasing/:id",
  verifyTokenAndRole("purchasing@edit"),
  PurchasingController.PurchasingScheduleSplitPurchasing
);
router.get(
  "/:id/history",
  verifyTokenAndRole("purchasing@view"),
  PurchasingController.PurchasingScheduleHistory
);
router.get(
  "/history",
  verifyTokenAndRole("purchasing@view"),
  PurchasingController.PurchasingScheduleHistoryAll
);
router.get(
  "/:id/transactions",
  verifyTokenAndRole("purchasing@view"),
  PurchasingController.PurchasingScheduleTransactions
);
// router.delete("/:id", PurchasingController.PurchasingScheduleDelete);

export default router;

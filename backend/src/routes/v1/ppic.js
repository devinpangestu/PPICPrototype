import express from "express";
import * as PPICController from "../../controllers/PPICController.js";
import { verifyTokenAndRole } from "../../middlewares/auth.js";
const router = express.Router();

router.get(
  "/summary",
  verifyTokenAndRole("ppic@view"),
  PPICController.PPICScheduleSummary
);
router.get(
  "/",
  verifyTokenAndRole("ppic@view"),
  PPICController.PPICScheduleList
);
router.get(
  "/get-min-date",
  verifyTokenAndRole("ppic@view"),
  PPICController.PPICScheduleNeedActionMinDate
);
router.post(
  "/",
  verifyTokenAndRole("ppic@create"),
  PPICController.PPICScheduleCreate
);
router.put(
  "/",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleEdit
);
router.put(
  "/refresh-outs",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleRefreshPOOuts
);
router.put(
  "/sendt-purchasing",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleSendToPurchasing
);
router.put(
  "/accept-split",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleAcceptSplitSupplier
);
router.put(
  "/reject-split",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleRejectSplitSupplier
);

router.put(
  "/accept-edit",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleAcceptEditSupplier
);
router.put(
  "/reject-edit",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleRejectEditSupplier
);
router.put(
  "/accept-close-po",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleAcceptClosePOSupplier
);
router.put(
  "/reject-close-po",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleRejectClosePOSupplier
);
router.get(
  "/po-details",
  verifyTokenAndRole("ppic@view"),
  PPICController.PPICScheduleGetPODetails
);
router.get(
  "/:id",
  verifyTokenAndRole("ppic@view"),
  PPICController.PPICScheduleGet
);

router.put(
  "/split-ppic/:id",
  verifyTokenAndRole("ppic@edit"),
  PPICController.PPICScheduleSplitPPIC
);
router.get(
  "/:id/history",
  verifyTokenAndRole("ppic@view"),
  PPICController.PPICScheduleHistory
);
// router.get("/history",verifyTokenAndRole("ppic@view"), PPICController.PPICScheduleHistoryAll);
// router.get("/:id/transactions",verifyTokenAndRole("ppic@view"), PPICController.PPICScheduleTransactions);
router.delete(
  "/:id",
  verifyTokenAndRole("ppic@delete"),
  PPICController.PPICScheduleDelete
);

export default router;

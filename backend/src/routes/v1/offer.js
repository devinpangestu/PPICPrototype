import express from "express";
import * as OfferController from "../../controllers/OfferController.js";
import { verifyTokenAndRole } from "../../middlewares/auth.js";
const router = express.Router();

router.get(
  "/summary",
  verifyTokenAndRole("offer@view"),
  OfferController.OfferSummary
);
router.get("/", verifyTokenAndRole("offer@view"), OfferController.OfferList);
router.get(
  "/get-min-date",
  verifyTokenAndRole("offer@view"),
  OfferController.OfferNeedActionMinDate
);
router.post(
  "/",
  verifyTokenAndRole("offer@create"),
  OfferController.OfferCreate
);
router.post(
  "/from-draft",
  verifyTokenAndRole("offer@create"),
  OfferController.OfferCreateFromDraft
);
router.put(
  "/:offer_id",
  verifyTokenAndRole("offer@create"),
  OfferController.OfferEdit
);
router.put(
  "/:offer_id/contract-number",
  verifyTokenAndRole("offer@create"),
  OfferController.OfferCreateContractNumber
);
router.get(
  "/:offer_id",
  verifyTokenAndRole("offer@view"),
  OfferController.OfferGet
);
router.put(
  "/:offer_id/assess",
  verifyTokenAndRole("offer@assess"),
  OfferController.OfferAssess
);
router.put(
  "/:offer_id/queue-for-po-creation",
  OfferController.OfferQueueforPOCreation
);
router.put(
  "/:offer_id/decide",
  verifyTokenAndRole("offer@decide"),
  OfferController.OfferDecide
);
router.put(
  "/:offer_id/accept-bid",
  verifyTokenAndRole("offer@accept_bid"),
  OfferController.OfferAcceptBid
);
router.put(
  "/:offer_id/reject-bid",
  verifyTokenAndRole("offer@reject_bid"),
  OfferController.OfferRejectBid
);
router.delete(
  "/:offer_id",
  verifyTokenAndRole("offer@delete"),
  OfferController.OfferDelete
);

export default router;

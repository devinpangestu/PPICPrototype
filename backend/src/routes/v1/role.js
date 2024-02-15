import express from "express";
import * as RoleController from "../../controllers/RoleController.js";
import {verifyTokenAndRole} from "../../middlewares/auth.js";
const router = express.Router();

router.put(
  "/permissions",
  verifyTokenAndRole("role@edit"),
  RoleController.RoleEditPermissions
);
router.get("/", RoleController.RoleList);
router.post("/", verifyTokenAndRole("role@create"), RoleController.RoleCreate);
router.get("/:id", RoleController.RoleGet);
router.put("/:id", verifyTokenAndRole("role@edit"), RoleController.RoleEdit);
router.delete(
  "/:id",
  verifyTokenAndRole("role@delete"),
  RoleController.RoleDelete
);

export default router;

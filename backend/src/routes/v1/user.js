import express from "express";
import * as UserController from "../../controllers/UserController.js";
import { verifyTokenAndRole } from "../../middlewares/auth.js";
const router = express.Router();

router.get("/", UserController.UserList);
router.post("/", verifyTokenAndRole("user@view"), UserController.UserCreate);
// router.put("/change-password", UserController.UserChangePassword)
router.get(
  "/:user_id",

  UserController.UserGet
);
router.put(
  "/:user_id",
  verifyTokenAndRole("user@view"),
  UserController.UserEdit
);
router.delete(
  "/:user_id",
  verifyTokenAndRole("user@view"),
  UserController.UserDelete
);

//admin privileges
router.put(
  "/:user_id/reset-pwd",
  verifyTokenAndRole("user@view"),
  UserController.UserResetPwd
);

router.get("/:token_id/verify/:token_frag", UserController.UserVerifyEmail);

export default router;

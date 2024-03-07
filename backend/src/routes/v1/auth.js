import express from "express";
import * as AuthController from "../../controllers/AuthController.js";

const router = express.Router();

router.get("/", AuthController.GetAuthenticatedUser);
router.post("/token-check", AuthController.TokenCheck);
router.post("/login", AuthController.Login);
router.post("/login-refresh-token", AuthController.LoginRfToken);
router.post("/logout", AuthController.Logout);
router.put("/change-password", AuthController.ChangePwd);

export default router;

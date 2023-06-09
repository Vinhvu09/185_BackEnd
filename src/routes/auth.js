import express from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  profile,
  refreshToken,
  resetPassword,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/refresh-token", refreshToken);
router.get("/logout", logout);
router.get("/profile", profile);
router.patch("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/change-password/:id", changePassword);

export default router;

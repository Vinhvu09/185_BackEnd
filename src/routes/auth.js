import express from "express";
import {
  changePassword,
  forgotPassword,
  login,
  resetPassword,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);
router.patch("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/change-password/:id", changePassword);

export default router;

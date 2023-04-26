import express from "express";
import { forgotPassword, login } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);
router.patch("/forgot-password", forgotPassword);

export default router;

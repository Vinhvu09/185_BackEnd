import express from "express";
import { saveFile, uploadFile } from "../controllers/artefact.js";

const router = express.Router();

router.route("/").post(uploadFile, saveFile);

export default router;

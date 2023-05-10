import express from "express";
import { getFolderPath, saveFile, upload } from "../controllers/artefact.js";

const router = express.Router();

router.post("/upload", upload, saveFile);
router.get("/folder-path", getFolderPath);

export default router;

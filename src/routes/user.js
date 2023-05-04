import express from "express";
import { uploadImage } from "../controllers/auth.js";
import { create, detail, getAll, remove, update } from "../controllers/user.js";

const router = express.Router();

router.route("/").get(getAll).post(uploadImage, create);
router.route("/:id").get(detail).patch(update).delete(remove);

export default router;

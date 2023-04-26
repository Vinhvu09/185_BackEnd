import express from "express";
import { create, detail, getAll, remove, update } from "../controllers/user.js";

const router = express.Router();

router.route("/").get(getAll).post(create);
router.route("/:id").get(detail).patch(update).delete(remove);

export default router;

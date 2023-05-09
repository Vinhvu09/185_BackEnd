import express from "express";
import {
  create,
  detail,
  getAll,
  remove,
  resizeImage,
  update,
  uploadImage,
} from "../controllers/user.js";

const router = express.Router();

router.route("/").get(getAll).post(uploadImage, resizeImage, create);
router
  .route("/:id")
  .get(detail)
  .patch(uploadImage, resizeImage, update)
  .delete(remove);

export default router;

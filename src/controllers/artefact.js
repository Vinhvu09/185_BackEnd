import multer from "multer";
import zlib from "zlib";

import config from "../configs/index.js";
import { ERROR_CODE } from "../constant/common.js";
import { catchErrorAsync } from "../utils/common.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + "/public/unity");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export const uploadFile = upload.array("file");

export const saveFile = catchErrorAsync((req, res, next) => {});

import multer from "multer";

import config from "../configs/index.js";
import { ERROR_CODE } from "../constant/common.js";
import {
  catchErrorAsync,
  createFolder,
  ErrorMessage,
  getDirName,
} from "../utils/common.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderName = file["originalname"].split(".")[0].toLocaleLowerCase();
    const filePath = path.join(config.unityPath, folderName);
    createFolder(filePath);
    cb(null, filePath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.toLocaleLowerCase());
  },
});

function fileFilter(req, file, cb) {
  const extensionAllow = ["octet-stream", "javascript"];
  if (extensionAllow.includes(file["mimetype"].split("/")[1])) {
    cb(null, true);
  } else {
    cb(new ErrorMessage("File extension don't allow!", ERROR_CODE.badRequest));
  }
}

export const upload = multer({ storage, fileFilter }).array("files");

export const saveFile = (req, res, next) => {
  res.status(ERROR_CODE.OK).json({
    status: "success",
    message: "Save file to server success!",
  });
};

export const getFolderPath = catchErrorAsync(async (req, res, next) => {
  res.status(ERROR_CODE.OK).json({
    status: "success",
    data: await getDirName(config.unityPath),
  });
});

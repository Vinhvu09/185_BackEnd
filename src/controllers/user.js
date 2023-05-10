import multer from "multer";
import sharp from "sharp";
import path from "path";
import _ from "lodash";
import fs from "fs";

import {
  deleteById,
  findAll,
  findById,
  updateByIdOrCreate,
} from "../middlewares/factory.js";
import UserModel from "../models/user.js";
import config from "../configs/index.js";
import { catchErrorAsync, createFolder } from "../utils/common.js";

function parseUserBody(data) {
  const {
    signature,
    stamp,
    work_days,
    basic_salary,
    bank_department,
    confirmPassword,
    password,
    bank,
    card_number,
    card_name,
    department,
    position,
    role,
    email,
    last_name,
    first_name,
    avatar,
    phone_number,
    country,
    province,
    district,
    ward,
    address,
    code,
  } = data;

  return {
    email,
    last_name,
    first_name,
    avatar,
    phone_number,
    country,
    province,
    district,
    ward,
    address,
    confirmPassword,
    password,
    code,
    jobInfo: {
      department,
      position,
      role,
    },
    paymentInfo: {
      signature,
      stamp,
      work_days,
      basic_salary,
      bank_department,
      bank,
      card_number,
      card_name,
    },
  };
}

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new ErrorMessage("File extention don't allow", ERROR_CODE.badRequest),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

export const uploadImage = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "stamp", maxCount: 1 },
]);

export const resizeImage = catchErrorAsync(async (req, res, next) => {
  const { id } = req.userInfo;
  const rootPath = path.join(config.imagePath, id);
  if (_.isEmpty(req.files)) return next();

  createFolder(rootPath);
  for (const key in req.files) {
    const file = _.first(req.files[key]);
    const fileName = `${id}-${key}.jpeg`;
    file.fileName = path.join(id, fileName);
    await sharp(file.buffer)
      .resize(300)
      .jpeg({ quality: 50 })
      .toFile(path.join(rootPath, fileName));
  }
  next();
});

export const create = (req, res, next) => {
  _.values(req.files).forEach((file) => {
    const image = _.first(file);
    req.body[image.fieldname] = image.fileName;
  });
  req.body = parseUserBody(req.body);

  updateByIdOrCreate(UserModel, false)(req, res, next);
};

export const getAll = function (req, res, next) {
  const search = {};
  findAll(UserModel, search)(req, res, next);
};

export const detail = findById(UserModel);

export const remove = deleteById(UserModel);

export const update = (req, res, next) => {
  _.values(req.files).forEach((file) => {
    const image = _.first(file);
    req.body[image.fieldname] = image.fileName;
  });
  req.body = parseUserBody(req.body);
  updateByIdOrCreate(UserModel, true, ["password", "confirmPassword"])(
    req,
    res,
    next
  );
};

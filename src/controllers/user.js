import {
  deleteById,
  findAll,
  findById,
  updateByIdOrCreate,
} from "../middlewares/factory.js";
import UserModel from "../models/user.js";

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

export const create = (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
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
  req.body = parseUserBody(req.body);
  updateByIdOrCreate(UserModel, true, ["password", "confirmPassword"])(
    req,
    res,
    next
  );
};

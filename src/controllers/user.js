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

export async function create(req, res, next) {
  try {
    const payload = parseUserBody(req.body);
    const doc = await UserModel.create(payload);
    res.status(200).json({
      status: "Success",
      data: doc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Fail",
      message: "Internal server",
    });
  }
}
export async function getAll(req, res, next) {
  try {
    const docs = await UserModel.find();
    res.status(200).json({
      status: "Success",
      data: docs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Fail",
      message: "Internal server",
    });
  }
}
export async function detail(req, res, next) {
  try {
    const { id } = req.params;
    const docs = await UserModel.findById(id);
    res.status(200).json({
      status: "Success",
      data: docs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Fail",
      message: "Internal server",
    });
  }
}
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const docs = await UserModel.findByIdAndDelete(id);
    res.status(200).json({
      status: "Success",
      data: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Fail",
      message: "Internal server",
    });
  }
}
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const payload = parseUserBody(req.body);
    const doc = await UserModel.findByIdAndUpdate(id, payload, {
      runValidators: true,
      returnDocument: "after",
    });
    res.status(200).json({
      status: "Success",
      data: doc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Fail",
      message: "Internal server",
    });
  }
}

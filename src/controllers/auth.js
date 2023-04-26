import _ from "lodash";

import UserModel from "../models/user.js";
import { ErrorMessage, catchErrorAsync, sendEmail } from "../utils/helper.js";
import { signToken, verifyToken } from "../utils/common.js";
import { ERROR_CODE } from "../constant/error-code.js";

function handleResponse(res, doc) {
  const token = signToken({ id: doc._id, user_code: doc.code });

  res.status(ERROR_CODE.OK).json({
    status: "success",
    token,
  });
}

function setCookie(res, data) {
  res.cookie("token", data, {
    expires,
  });
}

export const login = catchErrorAsync(async (req, res, next) => {
  const { user_code, password } = req.body;

  if (_.isNil(user_code) || _.isNil(password)) {
    return next(
      new ErrorMessage(
        "user_code or password is required",
        ERROR_CODE.badRequest
      )
    );
  }

  const doc = await UserModel.findOne({ code: user_code }).select("+password");
  if (_.isEmpty(doc)) {
    return next(new ErrorMessage("User not exist or deactivate"));
  }

  if (!(await doc.isValidPassword(password))) {
    return next(new ErrorMessage("Wrong password!", ERROR_CODE.unauthorized));
  }

  handleResponse(res, doc.toObject());
});

export const forgotPassword = catchErrorAsync(async (req, res, next) => {
  const { email } = req.body;

  if (_.isEmpty(email)) {
    return next(new ErrorMessage("email is required", ERROR_CODE.badRequest));
  }

  const doc = await UserModel.findOne({ email });
  if (_.isEmpty(doc)) {
    return next(new ErrorMessage("User not exist or deactivate"));
  }

  const resetToken = doc.createResetToken();
  await doc.save({ validateModifiedOnly: true });

  const endpointResetPassword = `${req.protocol}/api/v1/auth/reset-password/${resetToken}`;
  const text = `Link to reset password: ${endpointResetPassword}.\nIf you did'n forget, please ignore this mail.`;

  await sendEmail({
    to: doc.email,
    subject: "Link forgot password valid for 10 min",
    text,
  });

  res.status(ERROR_CODE.OK).json({
    status: "success",
    message: "token send to email",
  });
});

export const protect = catchErrorAsync(async (req, res, next) => {
  const isExcludeEndpoint = ["login", "forgot-password", "reset-password"].some(
    (x) => req.originalUrl.includes(x)
  );
  if (isExcludeEndpoint) {
    return next();
  }

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new ErrorMessage("Please login!", ERROR_CODE.unauthorized));
  }

  const token = req.headers.authorization.split(" ")[1];
  const decode = await verifyToken(token);

  if (_.isEmpty(decode)) {
    return next(
      new ErrorMessage(
        "Token invalid, please login again!",
        ERROR_CODE.unauthorized
      )
    );
  }

  const doc = await UserModel.findById(decode.id);
  if (_.isEmpty(doc)) {
    return next(
      new ErrorMessage("User not exist or deactivate", ERROR_CODE.forbidden)
    );
  }

  if (doc.isChangePassword(decode.iat)) {
    return next(
      new ErrorMessage("Password was changed", ERROR_CODE.unauthorized)
    );
  }

  req.userInfo = doc.toObject();
  next();
});

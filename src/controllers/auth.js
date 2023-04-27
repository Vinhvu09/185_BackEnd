import _ from "lodash";

import UserModel from "../models/user.js";
import { ErrorMessage, catchErrorAsync, sendEmail } from "../utils/helper.js";
import {
  createTokenbyCrypto,
  setCookie,
  signToken,
  verifyToken,
} from "../utils/common.js";
import { COOKIE_EXPIRES, ENVIROMENT, ERROR_CODE } from "../constant/common.js";

function handleResponse(res, doc) {
  const token = signToken({ id: doc._id, user_code: doc.code });
  setCookie(res, token, {
    expires: new Date(COOKIE_EXPIRES),
    secure: process.env.NODE_ENV === ENVIROMENT.prod,
    httpOnly: true,
  });

  res.status(ERROR_CODE.OK).json({
    status: "success",
    token,
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
    return next(
      new ErrorMessage("User not exist or deactivate", ERROR_CODE.unauthorized)
    );
  }

  if (!(await doc.isValidPassword(password))) {
    return next(new ErrorMessage("Wrong password!", ERROR_CODE.unauthorized));
  }

  handleResponse(res, doc.toObject());
});

export const profile = catchErrorAsync(async (req, res, next) => {
  const { _id } = req.userInfo;

  const docs = await UserModel.findById(_id);
  res.status(200).json({
    status: "success",
    data: docs,
  });
});

export const logout = catchErrorAsync(async (req, res, next) => {
  setCookie(res, "", {
    expires: new Date(),
    secure: process.env.NODE_ENV === ENVIROMENT.prod,
    httpOnly: true,
  });
  res.status(ERROR_CODE.noContent).json({
    status: "success",
    data: null,
  });
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

  const endpointResetPassword = `${req.headers.origin}/reset-password/${resetToken}`;
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

export const resetPassword = catchErrorAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (_.isEmpty(token))
    return next(
      new ErrorMessage(
        "No authen, Please access by link send to your email!",
        ERROR_CODE.unauthorized
      )
    );

  const resetToken = createTokenbyCrypto(token);
  const doc = await UserModel.findOne({
    "resetPassword.token": resetToken,
    "resetPassword.expires": { $gt: Date.now() },
  });

  if (_.isEmpty(doc)) {
    return next(
      new ErrorMessage(
        "token expires or token invalid!",
        ERROR_CODE.unauthorized
      )
    );
  }

  doc.password = password;
  doc.confirmPassword = confirmPassword;
  doc.resetPassword = undefined;
  doc.save({ validateModifiedOnly: true });

  handleResponse(res, doc.toObject);
});

export const changePassword = catchErrorAsync(async (req, res, next) => {
  const { currentPassword, password, confirmPassword } = req.body;
  const { id } = req.params;

  if (
    _.isEmpty(currentPassword) ||
    _.isEmpty(password) ||
    _.isEmpty(confirmPassword)
  )
    return next(new ErrorMessage("Missing data", ERROR_CODE.badRequest));

  const doc = await UserModel.findById(id).select("+password");
  if (_.isEmpty(doc)) {
    return next(
      new ErrorMessage("User not exist or deactivate", ERROR_CODE.notFound)
    );
  }

  if (!(await doc.isValidPassword(currentPassword))) {
    return next(new ErrorMessage("Wrong password!", ERROR_CODE.unauthorized));
  }

  doc.password = password;
  doc.confirmPassword = confirmPassword;
  doc.resetPassword = undefined;
  doc.save({ validateModifiedOnly: true });

  handleResponse(res, doc.toObject);
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
    !req.headers.authorization.startsWith("Bearer") ||
    _.isEmpty(req.cookies) ||
    !req.cookies.token
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

export const restricRole = (...roles) => {
  return (req, res, next) => {
    const {
      jobInfo: { role },
    } = req.userInfo;
    const isPermission = roles.some((r) => role === r);

    if (isPermission) {
      return next();
    }

    res.status(ERROR_CODE.unauthorized).json({
      status: "fail",
      message: "Role not allow access to the resource",
    });
  };
};

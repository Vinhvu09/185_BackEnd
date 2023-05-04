import _ from "lodash";
import multer from "multer";
import sharp from "sharp";

import { ERROR_CODE, EXPIRES_TIME } from "../constant/common.js";
import RefreshTokenModel from "../models/refresh-token.js";
import UserModel from "../models/user.js";
import {
  catchErrorAsync,
  createTokenbyCrypto,
  ErrorMessage,
  sendEmail,
  setCookie,
  signToken,
  verifyToken,
} from "../utils/common.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log(file);
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

export const uploadImage = upload.single("avatar");
// export const uploadImage = upload.fields([
//   {
//     name: "avatar",
//   },
//   {
//     name: "signature",
//   },
//   {
//     name: "stamp",
//   },
// ]);

function generateToken(data) {
  const { ipAddress, ...rest } = data;
  const accessToken = signToken(rest);
  const refreshToken = signToken(data, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  });

  return {
    token: accessToken,
    refreshToken,
  };
}

async function handleAuthenResponse(req, res, doc) {
  const expires = Date.now() + EXPIRES_TIME["7d"];
  const data = {
    id: doc.id,
    user_code: doc.code,
    role: doc.jobInfo.role,
    email: doc.email,
    ipAddress: req.ip,
  };
  const { token, refreshToken } = generateToken(data);

  await RefreshTokenModel.create({
    user: data.id,
    token: refreshToken,
    expires,
    createdByIp: data.ipAddress,
  });

  setCookie(res, "refreshToken", refreshToken, {
    expires: new Date(expires),
  });

  res.status(ERROR_CODE.OK).json({
    status: "success",
    token,
  });
}

export const refreshToken = catchErrorAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return next(
      new ErrorMessage("Please login again!", ERROR_CODE.unauthorized)
    );
  }

  const decode = await verifyToken(token);
  const doc = await RefreshTokenModel.findOne({ token });
  if (doc.isExpired) {
    return next(
      new ErrorMessage(
        "Refresh token was expired, please login again!",
        ERROR_CODE.unauthorized
      )
    );
  }

  const user = await UserModel.findById(decode.id);
  if (_.isEmpty(user)) {
    return next(
      new ErrorMessage("User not exist or deactivate", ERROR_CODE.unauthorized)
    );
  }
  if (user.isChangePassword(decode.iat)) {
    return next(
      new ErrorMessage(
        "Password was changed, please login again!",
        ERROR_CODE.unauthorized
      )
    );
  }

  await handleAuthenResponse(req, res, user);
  await RefreshTokenModel.deleteOne({ _id: doc.id });
});

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

  await handleAuthenResponse(req, res, doc);
});

export const profile = catchErrorAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: req.userInfo,
  });
});

export const logout = catchErrorAsync(async (req, res, next) => {
  const { _id: id } = req.userInfo;

  await RefreshTokenModel.deleteMany({ user: id });

  setCookie(res, "refreshToken", "", {
    expires: new Date(),
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

  await handleAuthenResponse(req, res, doc);
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

  await handleAuthenResponse(req, res, doc);
});

export const protect = catchErrorAsync(async (req, res, next) => {
  const isExcludeEndpoint = [
    "login",
    "forgot-password",
    "reset-password",
    "refresh-token",
  ].some((x) => req.originalUrl.includes(x));
  if (isExcludeEndpoint) {
    return next();
  }

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    _.isEmpty(req.cookies) ||
    !req.cookies.refreshToken
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

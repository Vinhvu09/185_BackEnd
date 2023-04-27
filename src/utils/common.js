import { promisify } from "util";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import {
  COOKIE_EXPIRES,
  ENVIROMENT,
  JWT_EXPIRES_IN,
} from "../constant/common.js";

export const signToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

export function createTokenbyCrypto(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function setCookie(res, token, options) {
  res.cookie("token", token, options);
}

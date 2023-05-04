import { promisify } from "util";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import { EXPIRES_TIME, ENVIROMENT } from "../constant/common.js";

export const signToken = (data, options = {}) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    ...options,
  });
};

export const verifyToken = (token) => {
  return promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

export function createTokenbyCrypto(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function setCookie(res, name = "jwt", data, options) {
  res.cookie(name, data, {
    expires: new Date(Date.now() + EXPIRES_TIME["1h"]),
    secure: process.env.NODE_ENV === ENVIROMENT.prod,
    httpOnly: true,
    sameSite: "strict",
    ...options,
  });
}

export class ErrorMessage extends Error {
  constructor(msg, statusCode) {
    super(msg);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function catchErrorAsync(asyncFn) {
  return (req, res, next) => {
    asyncFn(req, res, next).catch((error) => {
      next(error);
    });
  };
}

export async function sendEmail(options) {
  let transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: "admin@gmail.com",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

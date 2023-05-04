import mongoose from "mongoose";
import { findQueryRegex } from "../constant/regex.js";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: [true, "Need user id to link to refresh token!"],
    },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

refreshTokenSchema.pre(findQueryRegex, function (next) {
  this.select("-__v").populate({
    path: "user",
    select: "code jobInfo.role email",
  });
  next();
});

refreshTokenSchema.virtual("isExpired").get(function () {
  return this.expires.getTime() < Date.now();
});

const RefreshTokenModel = mongoose.model("RefreshTokens", refreshTokenSchema);
export default RefreshTokenModel;

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";

import { findQueryRegex, phoneNumberRegex } from "../constant/regex.js";
import { convertUnixTime } from "../utils/date.js";
import { createTokenbyCrypto } from "../utils/common.js";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "FirstName is required"],
    },
    last_name: {
      type: String,
      required: [true, "LastName is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    phone_number: {
      type: String,
      validate: {
        validator: function (v) {
          return phoneNumberRegex.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    country: {
      type: Number,
      enum: {
        values: [1, 2],
        message: "{VALUE} is not supported",
      },
    },
    province: Number,
    district: Number,
    ward: Number,
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Confirm password is required"],
      validate: {
        validator: function (v) {
          return v === this.password;
        },
        message: "Password confirm not match",
      },
    },
    address: String,
    code: {
      type: String,
      required: [true, "Code is required"],
      unique: true,
    },
    avatar: String,
    jobInfo: {
      department: {
        type: Number,
        required: [true, "Department required"],
        enum: {
          values: [1, 2],
          message: "{VALUE} is not supported",
        },
      },
      positions: {
        type: Number,
        equired: [true, "Postition required"],
        enum: {
          values: [1, 2],
          message: "{VALUE} is not supported",
        },
      },
      role: {
        type: Number,
        equired: [true, "Role required"],
        enum: {
          values: [1, 2],
          message: "{VALUE} is not supported",
        },
      },
    },
    paymentInfo: {
      card_name: {
        type: String,
        required: [true, "Name required"],
      },
      card_number: {
        type: Number,
        required: [true, "Account number required"],
      },
      bank: {
        type: String,
        required: [true, "Name bank required"],
      },
      bank_department: {
        type: String,
        required: [true, "Name branch required"],
      },
      basic_salary: {
        type: Number,
        required: [true, "Salary required"],
      },
      work_days: {
        type: Number,
        required: [true, "Work day required"],
      },
      signature: {
        type: String,
        required: [true, "Signature required"],
      },
      stamp: {
        type: String,
        required: [true, "Stamp required"],
      },
    },
    isActivate: {
      type: Boolean,
      default: true,
    },
    resetPassword: {
      token: String,
      expires: Date,
    },

    timeUpdatePassword: Date,
    createAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  if (this.isNew) return next();

  const TIME_DELAY = 1000;
  this.timeUpdatePassword = Date.now() - TIME_DELAY;
  next();
});

userSchema.pre(findQueryRegex, function (next) {
  this.find({ isActivate: true }).select(
    "-__v -timeUpdatePassword -createAt -isActivate"
  );
  next();
});

userSchema.methods.isChangePassword = function (time) {
  if (!this.timeUpdatePassword) return false;

  return convertUnixTime(this.timeUpdatePassword) > time;
};

userSchema.methods.isValidPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const TIME_EXPIRES = 10 * 60 * 1000;
  this.resetPassword.token = createTokenbyCrypto(resetToken);
  this.resetPassword.expires = Date.now() + TIME_EXPIRES;

  return resetToken;
};

const UserModel = mongoose.model("Users", userSchema);
export default UserModel;

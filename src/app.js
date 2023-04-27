import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import { ErrorMessage } from "./utils/common.js";
import { globalErrorHandler } from "./middlewares/error.js";
import { protect } from "./controllers/auth.js";
import { ERROR_CODE } from "./constant/common.js";

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many request from this IP, please try again in an hour!",
});

app.use(limiter);
app.use(cors());
app.use(bodyParser.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(xss());
app.use(mongoSanitize());

// Routes
app.use(protect);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/staff", userRouter);

// Handle global error
app.all("*", (req, res, next) => {
  req.next(
    new ErrorMessage(
      `Can't find ${req.originalUrl} on this server!`,
      ERROR_CODE.notFound
    )
  );
});
app.use(globalErrorHandler);

export default app;

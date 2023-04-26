import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import { ErrorMessage } from "./utils/helper.js";
import { globalErrorHandler } from "./middlewares/error.js";
import { ERROR_CODE } from "./constant/error-code.js";
import { protect } from "./controllers/auth.js";

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

import { ENVIROMENT, ERROR_CODE } from "../constant/common.js";

function handleErrorDev(error, res) {
  res.status(error.statusCode).json({
    status: "error",
    message: error.message,
    stack: error.stack,
  });
}

function handleErrorProd(error, res) {
  console.error(error);
  res.status(error.statusCode).json({
    status: "error",
    message: error.isOperational ? error.message : "Something went wrong!",
  });
}

export function globalErrorHandler(error, req, res, next) {
  error.statusCode = error.statusCode || ERROR_CODE.internalServer;

  if (process.env.NODE_ENV === ENVIROMENT.dev) {
    handleErrorDev(error, res);
  } else {
    handleErrorProd(error, res);
  }
}

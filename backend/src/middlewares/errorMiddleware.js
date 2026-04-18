import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err instanceof ApiError
      ? err.statusCode
      : err.name === "ValidationError"
      ? 400
      : err.code === 11000
      ? 409
      : 500;

  logger.error(err.message, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
};

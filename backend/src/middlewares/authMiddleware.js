import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token is missing");
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
};

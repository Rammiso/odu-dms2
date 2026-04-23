import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";

const DB_ROLE_TO_API_ROLE = {
  "Student": "student",
  "Dorm Admin": "dorm_admin",
  "Maintenance Staff": "maintenance",
  "Management": "management",
  "System Admin": "system_admin",
};

const API_ROLES = new Set(Object.values(DB_ROLE_TO_API_ROLE));

export const normaliseRole = (role) => {
  if (!role) return "student";
  if (API_ROLES.has(role)) return role;
  return DB_ROLE_TO_API_ROLE[role] || role.toLowerCase().replace(/\s+/g, "_");
};

export const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new ApiError(401, "Authorization token is missing");
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    // Always fetch the live role from DB — never trust the JWT role alone
    const user = await User.findById(decoded.sub).select("role status");
    if (!user || user.status === "Inactive") {
      throw new ApiError(401, "User not found or inactive");
    }

    const normalisedRole = normaliseRole(user.role);
    console.log(`[auth] user=${decoded.sub} db_role="${user.role}" → "${normalisedRole}"`);

    req.user = { id: decoded.sub, role: normalisedRole };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, "Invalid or expired token"));
  }
};

/**
 * Accepts snake_case role strings (matching the frontend's UserRole type):
 *   "student" | "dorm_admin" | "maintenance" | "management" | "system_admin"
 */
export const authorizeRoles = (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user?.role) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Insufficient permission (role: ${req.user.role}, required: ${allowedRoles.join("|")})`);
    }

    next();
  };

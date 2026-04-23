import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Maps DB role values (Title Case) → API role tokens (snake_case).
 * This lets the DB enum stay as-is while the JWT and frontend
 * always deal with consistent snake_case role strings.
 */
const DB_ROLE_TO_API_ROLE = {
  "Student": "student",
  "Dorm Admin": "dorm_admin",
  "Maintenance Staff": "maintenance",
  "Management": "management",
  "System Admin": "system_admin",
};

/** Also accept snake_case roles in case they are already normalised */
const API_ROLES = new Set(Object.values(DB_ROLE_TO_API_ROLE));

export const normaliseRole = (role) => {
  if (!role) return "student";
  if (API_ROLES.has(role)) return role;
  return DB_ROLE_TO_API_ROLE[role] || role.toLowerCase().replace(/\s+/g, "_");
};

export const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token is missing");
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const normalisedRole = normaliseRole(decoded.role);
    console.log(`[auth] decoded.role="${decoded.role}" → normalised="${normalisedRole}"`);
    req.user = {
      id: decoded.sub,
      role: normalisedRole,
    };

    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
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

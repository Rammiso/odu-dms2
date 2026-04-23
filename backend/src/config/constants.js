/**
 * System Constants
 * Hardcoded credentials and configuration values
 */

export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "Admin@2026",
  email: process.env.ADMIN_EMAIL || "admin@odu.edu.et",
  fullName: process.env.ADMIN_FULLNAME || "System Administrator",
  role: "System Admin",
};

export const SYSTEM_ROLES = {
  SYSTEM_ADMIN: "System Admin",
  DORM_ADMIN: "Dorm Admin",
  MAINTENANCE_STAFF: "Maintenance Staff",
  MANAGER: "Management",
  STUDENT: "Student",
};

export const USER_STATUSES = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const ROOM_STATUSES = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  UNDER_MAINTENANCE: "Under Maintenance",
};

export const MAINTENANCE_PRIORITIES = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const MAINTENANCE_STATUSES = {
  SUBMITTED: "Submitted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export const ROOM_CHANGE_REASONS = {
  CONFLICT: "conflict",
  MAINTENANCE: "maintenance",
  HEALTH: "health",
  OTHER: "other",
};

export const ROOM_CHANGE_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  ASSIGN: "ASSIGN",
};

export const NOTIFICATION_TYPES = {
  ROOM_ASSIGNMENT: "room_assignment",
  ROOM_CHANGE: "room_change",
  MAINTENANCE_UPDATE: "maintenance_update",
  ANNOUNCEMENT: "announcement",
};

export const GENDER_RESTRICTIONS = {
  MALE: "Male",
  FEMALE: "Female",
  NONE: "None",
};

export const ROOM_TYPES = {
  SINGLE: "Single",
  DOUBLE: "Double",
  TRIPLE: "Triple",
};

export const FURNITURE_CONDITIONS = {
  GOOD: "Good",
  FAIR: "Fair",
  DAMAGED: "Damaged",
  MISSING: "Missing",
};

export const KEY_CONDITIONS = {
  GOOD: "Good",
  DAMAGED: "Damaged",
  LOST: "Lost",
};

export const LINEN_ITEMS = [
  "Sheet",
  "Blanket",
  "Pillowcase",
  "Towel",
  "Mattress Cover",
];

export const FURNITURE_ITEMS = [
  "Bed",
  "Mattress",
  "Desk",
  "Chair",
  "Wardrobe",
  "Shelf",
  "Lamp",
  "Mirror",
];

export const MAINTENANCE_CATEGORIES = {
  PLUMBING: "Plumbing",
  ELECTRICAL: "Electrical",
  FURNITURE: "Furniture",
  SANITATION: "Sanitation",
  OTHER: "Other",
};

export const PAGINATION = {
  DEFAULT_LIMIT: 25,
  DEFAULT_OFFSET: 0,
  MAX_LIMIT: 100,
};

export const SESSION_CONFIG = {
  JWT_EXPIRES_IN: "7d",
  REFRESH_TOKEN_EXPIRES_IN: 30 * 24 * 60 * 60 * 1000, // 30 days
  PASSWORD_RESET_EXPIRES_IN: 60 * 60 * 1000, // 1 hour
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};

export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  FULLNAME_MIN_LENGTH: 2,
  FULLNAME_MAX_LENGTH: 120,
  PHONE_PATTERN: /^[0-9]{10}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UNIVERSITY_EMAIL_DOMAIN: "@odu.edu.et",
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid credentials",
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  USERNAME_ALREADY_EXISTS: "Username already exists",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions",
  INVALID_TOKEN: "Invalid or expired token",
  SESSION_EXPIRED: "Session expired",
  INVALID_EMAIL_DOMAIN: "Email must be from @odu.edu.et domain",
  ROOM_AT_CAPACITY: "Room is at maximum capacity",
  STUDENT_ALREADY_ASSIGNED: "Student is already assigned to a room",
  INVALID_ROLE: "Invalid user role",
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTRATION_SUCCESS: "Registration successful",
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  PASSWORD_RESET: "Password reset successful",
  ROOM_ASSIGNED: "Room assigned successfully",
};

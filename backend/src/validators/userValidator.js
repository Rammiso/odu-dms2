import Joi from "joi";

const roleValues = [
  // snake_case (frontend sends these)
  "student", "dorm_admin", "maintenance", "management", "system_admin",
  // Title Case (DB enum values — also accepted)
  "Student", "Dorm Admin", "Maintenance Staff", "Management", "System Admin",
];

export const createUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid(...roleValues).required(),
  studentId: Joi.string().max(50).optional(),
  gender: Joi.string().valid("M", "F").optional(),
  department: Joi.string().max(100).optional(),
  year: Joi.number().integer().min(1).max(6).optional(),
  phone: Joi.string().max(20).optional(),
  password: Joi.string().min(6).optional(),
  tempPassword: Joi.boolean().optional(),
});

export const updateUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(120).optional(),
  email: Joi.string().email().optional(),
  status: Joi.string().valid("active", "inactive", "Active", "Inactive").optional(),
  role: Joi.string().valid(...roleValues).optional(),
}).min(1);

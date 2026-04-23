import Joi from "joi";

export const eligibleStudentsSchema = Joi.object({
  gender: Joi.string().valid("M", "F", "all").optional(),
  year: Joi.number().integer().min(1).max(6).optional(),
  department: Joi.string().max(100).optional(),
  previewOnly: Joi.boolean().optional(),
});

export const autoAllocateSchema = Joi.object({
  gender: Joi.string().valid("M", "F", "all").optional(),
  year: Joi.number().integer().min(1).max(6).optional(),
  department: Joi.string().max(100).optional(),
  previewOnly: Joi.boolean().optional(),
});

export const manualAllocateSchema = Joi.object({
  studentId: Joi.string().required(),
  roomId: Joi.string().required(),
});

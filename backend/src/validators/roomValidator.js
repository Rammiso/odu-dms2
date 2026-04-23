import Joi from "joi";

export const createDormSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  code: Joi.string().min(1).max(20).required(),
  location: Joi.string().max(200).optional().default(""),
  address: Joi.string().max(200).optional(),
  warden: Joi.string().max(120).optional(),
});

export const addFloorSchema = Joi.object({
  floorNumber: Joi.number().integer().min(0).required(),
});

export const createRoomSchema = Joi.object({
  dormId: Joi.string().optional(),
  buildingId: Joi.string().optional(),
  floor: Joi.number().integer().min(0).required(),
  roomNumber: Joi.string().min(1).max(20).required(),
  type: Joi.string().valid("Single", "Double", "Triple").required(),
  capacity: Joi.number().integer().min(1).max(10).required(),
  genderRestriction: Joi.string().valid("Male", "Female", "None").required(),
}).or("dormId", "buildingId");

export const updateRoomSchema = Joi.object({
  floor: Joi.number().integer().min(0).optional(),
  roomNumber: Joi.string().min(1).max(20).optional(),
  type: Joi.string().valid("Single", "Double", "Triple").optional(),
  capacity: Joi.number().integer().min(1).max(10).optional(),
  genderRestriction: Joi.string().valid("Male", "Female", "None").optional(),
  status: Joi.string().valid("Available", "Occupied", "Under Maintenance", "Full", "Maintenance").optional(),
}).min(1);

import { Dorm } from "../models/Dorm.js";

export const dormRepository = {
  findAll: () => Dorm.find({}).sort({ name: 1 }),
  findById: (id) => Dorm.findById(id),
  findByCode: (code) => Dorm.findOne({ code: String(code).toUpperCase() }),
  create: (payload) => Dorm.create(payload),
  updateById: (id, payload) =>
    Dorm.findByIdAndUpdate(id, payload, { new: true, runValidators: true }),
};

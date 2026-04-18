import { Room } from "../models/Room.js";

export const roomRepository = {
  findAll: (filter = {}) => Room.find(filter).populate("dormId", "name code"),
  findById: (id) => Room.findById(id).populate("dormId", "name code"),
  findAvailable: (filter = {}) =>
    Room.find({ ...filter, status: "Available" }).populate("dormId", "name code"),
  create: (payload) => Room.create(payload),
  updateById: (id, payload) =>
    Room.findByIdAndUpdate(id, payload, { new: true, runValidators: true }),
  incrementOccupancy: (id, delta) =>
    Room.findByIdAndUpdate(id, { $inc: { currentOccupancy: delta } }, { new: true }),
};

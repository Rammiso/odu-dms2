import { RoomChangeRequest } from "../models/RoomChangeRequest.js";

export const roomChangeRepository = {
  findById: (id) => RoomChangeRequest.findById(id),
  findByStudent: (studentId) =>
    RoomChangeRequest.find({ student: studentId }).sort({ submittedAt: -1 }),
  findPending: () => RoomChangeRequest.find({ status: "pending" }).sort({ submittedAt: -1 }),
  create: (payload) => RoomChangeRequest.create(payload),
  updateById: (id, payload) =>
    RoomChangeRequest.findByIdAndUpdate(id, payload, { new: true, runValidators: true }),
};

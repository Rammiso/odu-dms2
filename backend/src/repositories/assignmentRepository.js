import { Assignment } from "../models/Assignment.js";

export const assignmentRepository = {
  findActiveByStudent: (studentId) =>
    Assignment.findOne({ student: studentId, status: "Active" })
      .populate("student")
      .populate("room")
      .populate("dorm"),
  findById: (id) => Assignment.findById(id),
  findAll: (filter = {}) => Assignment.find(filter).populate("student room dorm"),
  create: (payload) => Assignment.create(payload),
  vacateById: (id) =>
    Assignment.findByIdAndUpdate(
      id,
      { status: "Vacated", endDate: new Date() },
      { new: true, runValidators: true }
    ),
};

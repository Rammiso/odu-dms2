import { Student } from "../models/Student.js";

export const studentRepository = {
  findByUserId: (userId) => Student.findOne({ user: userId }),
  findById: (id) => Student.findById(id),
  findByStudentId: (studentId) => Student.findOne({ studentId }),
  findAll: (filter = {}, options = {}) =>
    Student.find(filter)
      .skip(options.offset || 0)
      .limit(options.limit || 0)
      .sort(options.sort || { createdAt: -1 }),
  count: (filter = {}) => Student.countDocuments(filter),
  create: (payload) => Student.create(payload),
  updateById: (id, payload) =>
    Student.findByIdAndUpdate(id, payload, { new: true, runValidators: true }),
};

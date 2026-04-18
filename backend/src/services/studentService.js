import { assignmentRepository } from "../repositories/assignmentRepository.js";
import { maintenanceRepository } from "../repositories/maintenanceRepository.js";
import { studentRepository } from "../repositories/studentRepository.js";
import { ApiError } from "../utils/ApiError.js";

export const studentService = {
  getAssignment: async (userId) => {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new ApiError(404, "Student profile not found");
    }

    const assignment = await assignmentRepository.findActiveByStudent(student.id);
    if (!assignment) {
      throw new ApiError(404, "No active assignment found");
    }

    return assignment;
  },

  getMaintenanceHistory: async (userId, query) => {
    const limit = Number(query.limit || 10);
    const offset = Number(query.offset || 0);

    const requests = await maintenanceRepository.findBySubmitter(userId, { limit, offset });
    return { requests, total: requests.length };
  },

  getProfile: async (userId) => {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new ApiError(404, "Student profile not found");
    }

    return student;
  },
};

import { dormRepository } from "../repositories/dormRepository.js";
import { roomRepository } from "../repositories/roomRepository.js";
import { studentRepository } from "../repositories/studentRepository.js";
import { assignmentRepository } from "../repositories/assignmentRepository.js";
import { ApiError } from "../utils/ApiError.js";

export const roomService = {
  getAllDorms: () => dormRepository.findAll(),

  createDorm: async (payload) => {
    const existing = await dormRepository.findByCode(payload.code);
    if (existing) {
      throw new ApiError(409, "Dorm code already exists");
    }

    return dormRepository.create(payload);
  },

  addFloor: async (dormId, payload) => {
    const dorm = await dormRepository.findById(dormId);
    if (!dorm) {
      throw new ApiError(404, "Dorm not found");
    }

    const floorNumber = Number(payload.floorNumber);
    if (!Number.isInteger(floorNumber) || floorNumber < 1) {
      throw new ApiError(400, "floorNumber must be a positive integer");
    }

    if (!dorm.floors.includes(floorNumber)) {
      dorm.floors.push(floorNumber);
      dorm.floors.sort((a, b) => a - b);
      await dorm.save();
    }

    return dorm;
  },

  getRooms: async (query) => {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.floor) filter.floor = Number(query.floor);
    if (query.gender) filter.genderRestriction = query.gender;

    return roomRepository.findAll(filter);
  },

  createRoom: (payload) => roomRepository.create({ dormId: payload.buildingId, ...payload }),
  getRoom: (roomId) => roomRepository.findById(roomId),
  updateRoom: (roomId, payload) => roomRepository.updateById(roomId, payload),

  getRoomOccupants: async (roomId) => {
    const assignments = await assignmentRepository.findAll({ room: roomId, status: "Active" });
    const students = assignments.map((item) => item.student).filter(Boolean);
    return { students };
  },

  getAvailableRooms: async (query) => {
    const filter = {};
    if (query.gender) filter.genderRestriction = query.gender;
    if (query.type) filter.type = query.type;

    const rooms = await roomRepository.findAvailable(filter);
    return { rooms };
  },

  getUnassignedStudents: async () => {
    const students = await studentRepository.findAll({});
    const result = [];

    for (const student of students) {
      const active = await assignmentRepository.findActiveByStudent(student.id);
      if (!active) {
        result.push(student);
      }
    }

    return { students: result };
  },
};

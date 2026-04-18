import { assignmentRepository } from "../repositories/assignmentRepository.js";
import { roomRepository } from "../repositories/roomRepository.js";
import { studentRepository } from "../repositories/studentRepository.js";
import { ApiError } from "../utils/ApiError.js";

export const allocationService = {
  getEligibleStudents: async (filters = {}) => {
    const studentFilter = {};
    if (filters.gender && filters.gender !== "all") {
      studentFilter.gender = filters.gender;
    }
    if (filters.year) {
      studentFilter.year = Number(filters.year);
    }
    if (filters.department) {
      studentFilter.department = filters.department;
    }

    const students = await studentRepository.findAll(studentFilter);
    const rooms = await roomRepository.findAvailable({});
    const totalBedsAvailable = rooms.reduce((sum, room) => sum + room.availableBeds, 0);

    return { students, totalBedsAvailable };
  },

  autoAllocate: async (payload, actorId) => {
    const { students, totalBedsAvailable } = await allocationService.getEligibleStudents(payload);
    const availableRooms = await roomRepository.findAvailable({});

    if (payload.previewOnly) {
      const estimatedAssigned = Math.min(students.length, totalBedsAvailable);
      return {
        eligibleStudents: students.length,
        totalBedsAvailable,
        estimatedSuccessRate: students.length ? estimatedAssigned / students.length : 0,
        estimatedAssigned,
        estimatedUnassigned: students.length - estimatedAssigned,
      };
    }

    const assigned = [];
    const unassigned = [];

    for (const student of students) {
      const existing = await assignmentRepository.findActiveByStudent(student.id);
      if (existing) {
        continue;
      }

      const room = availableRooms.find((candidate) => candidate.availableBeds > 0);
      if (!room) {
        unassigned.push(student);
        continue;
      }

      const assignment = await assignmentRepository.create({
        student: student.id,
        room: room.id,
        dorm: room.dormId,
        assignedBy: actorId,
      });

      room.currentOccupancy += 1;
      room.status = room.currentOccupancy >= room.capacity ? "Full" : "Available";
      await room.save();

      assigned.push(assignment);
    }

    return {
      assigned,
      unassigned,
      summary: {
        totalAssigned: assigned.length,
        totalUnassigned: unassigned.length,
        reason: unassigned.length ? "Insufficient bed capacity" : "All eligible students allocated",
      },
    };
  },

  manualAllocate: async (payload, actorId) => {
    const student = await studentRepository.findById(payload.studentId);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const room = await roomRepository.findById(payload.roomId);
    if (!room) {
      throw new ApiError(404, "Room not found");
    }

    if (room.currentOccupancy >= room.capacity || room.status === "Maintenance") {
      throw new ApiError(400, "Assignment not allowed for selected room");
    }

    const existing = await assignmentRepository.findActiveByStudent(student.id);
    if (existing) {
      throw new ApiError(400, "Student already has an active assignment");
    }

    const assignment = await assignmentRepository.create({
      student: student.id,
      room: room.id,
      dorm: room.dormId,
      assignedBy: actorId,
      reason: "Manual allocation",
    });

    room.currentOccupancy += 1;
    room.status = room.currentOccupancy >= room.capacity ? "Full" : "Available";
    await room.save();

    return assignment;
  },

  vacateRoom: async (assignmentId) => {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment || assignment.status !== "Active") {
      throw new ApiError(404, "Active assignment not found");
    }

    const room = await roomRepository.findById(assignment.room);
    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy -= 1;
      room.status = room.currentOccupancy >= room.capacity ? "Full" : "Available";
      await room.save();
    }

    await assignmentRepository.vacateById(assignmentId);
    return { message: "Student vacated successfully" };
  },
};

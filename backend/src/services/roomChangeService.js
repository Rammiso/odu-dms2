import { assignmentRepository } from "../repositories/assignmentRepository.js";
import { roomChangeRepository } from "../repositories/roomChangeRepository.js";
import { roomRepository } from "../repositories/roomRepository.js";
import { studentRepository } from "../repositories/studentRepository.js";
import { ApiError } from "../utils/ApiError.js";

export const roomChangeService = {
  getMyRequests: async (userId) => {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new ApiError(404, "Student profile not found");
    }

    const requests = await roomChangeRepository.findByStudent(student.id);
    return { requests };
  },

  submit: async (userId, payload) => {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new ApiError(404, "Student profile not found");
    }

    const activeAssignment = await assignmentRepository.findActiveByStudent(student.id);
    if (!activeAssignment) {
      throw new ApiError(400, "Student does not have an active room assignment");
    }

    return roomChangeRepository.create({
      student: student.id,
      currentRoom: activeAssignment.room,
      reason: payload.reason,
      description: payload.description,
    });
  },

  getPending: async () => ({ requests: await roomChangeRepository.findPending() }),

  approve: async (requestId, payload, reviewerId) => {
    const request = await roomChangeRepository.findById(requestId);
    if (!request || request.status !== "pending") {
      throw new ApiError(404, "Pending request not found");
    }

    const room = await roomRepository.findById(payload.newRoomId);
    if (!room) {
      throw new ApiError(404, "Requested room not found");
    }

    if (room.currentOccupancy >= room.capacity || room.status === "Maintenance") {
      throw new ApiError(400, "Requested room is not available");
    }

    const activeAssignment = await assignmentRepository.findActiveByStudent(request.student);
    if (activeAssignment) {
      await assignmentRepository.vacateById(activeAssignment.id);
      const oldRoom = await roomRepository.findById(activeAssignment.room);
      if (oldRoom && oldRoom.currentOccupancy > 0) {
        oldRoom.currentOccupancy -= 1;
        oldRoom.status = oldRoom.currentOccupancy >= oldRoom.capacity ? "Full" : "Available";
        await oldRoom.save();
      }
    }

    const assignment = await assignmentRepository.create({
      student: request.student,
      room: room.id,
      dorm: room.dormId,
      assignedBy: reviewerId,
      reason: "Room change approved",
    });

    room.currentOccupancy += 1;
    room.status = room.currentOccupancy >= room.capacity ? "Full" : "Available";
    await room.save();

    await roomChangeRepository.updateById(requestId, {
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      requestedRoom: room.id,
      newAssignment: assignment.id,
    });

    return assignment;
  },

  reject: async (requestId, payload, reviewerId) => {
    const request = await roomChangeRepository.findById(requestId);
    if (!request || request.status !== "pending") {
      throw new ApiError(404, "Pending request not found");
    }

    await roomChangeRepository.updateById(requestId, {
      status: "rejected",
      rejectionReason: payload.rejectionReason,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    });

    return { message: "Request rejected" };
  },
};

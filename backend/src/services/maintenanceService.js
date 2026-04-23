import { maintenanceRepository } from "../repositories/maintenanceRepository.js";
import { ApiError } from "../utils/ApiError.js";

const buildFilter = (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  return filter;
};

export const maintenanceService = {
  getRequests: async (query, user) => {
    const filter = buildFilter(query);
    // Students only see their own submissions
    if (user?.role === "student") {
      filter.submittedBy = user.id;
    }
    const requests = await maintenanceRepository.findAll(filter);
    return { requests };
  },

  submit: async (userId, payload) => {
    const sequence = Date.now();
    return maintenanceRepository.create({
      requestId: `MR-${new Date().getFullYear()}-${String(sequence).slice(-6)}`,
      roomId: payload.roomId,
      category: payload.category,
      description: payload.description,
      priority: payload.priority,
      submittedBy: userId,
      trackingNumber: `TRK-${sequence}`,
    });
  },

  getAssigned: async (userId) => {
    const tasks = await maintenanceRepository.findAssigned(userId);
    return { tasks };
  },

  updateStatus: async (requestId, payload) => {
    const request = await maintenanceRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, "Maintenance request not found");
    }

    const updated = await maintenanceRepository.updateById(requestId, {
      status: payload.status,
      resolutionNotes: payload.resolutionNotes,
    });

    return { message: "Status updated", request: updated };
  },

  addNote: async (requestId, payload, userId) => {
    const request = await maintenanceRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, "Maintenance request not found");
    }

    request.notes.push({
      note: payload.note,
      isInternal: Boolean(payload.isInternal),
      addedBy: userId,
      addedAt: new Date(),
    });

    await request.save();
    return { note: request.notes[request.notes.length - 1] };
  },

  reassign: async (requestId, payload) => {
    const request = await maintenanceRepository.findById(requestId);
    if (!request) {
      throw new ApiError(404, "Maintenance request not found");
    }

    await maintenanceRepository.updateById(requestId, { assignedTo: payload.staffId });
    return { message: "Reassigned successfully" };
  },
};

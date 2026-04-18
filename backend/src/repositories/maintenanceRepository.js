import { MaintenanceRequest } from "../models/MaintenanceRequest.js";

export const maintenanceRepository = {
  findById: (id) => MaintenanceRequest.findById(id),
  findAll: (filter = {}) =>
    MaintenanceRequest.find(filter)
      .populate("roomId submittedBy assignedTo")
      .sort({ submittedAt: -1 }),
  findBySubmitter: (userId, options = {}) =>
    MaintenanceRequest.find({ submittedBy: userId })
      .skip(options.offset || 0)
      .limit(options.limit || 0)
      .sort({ submittedAt: -1 }),
  findAssigned: (userId) => MaintenanceRequest.find({ assignedTo: userId }).sort({ submittedAt: -1 }),
  create: (payload) => MaintenanceRequest.create(payload),
  updateById: (id, payload) =>
    MaintenanceRequest.findByIdAndUpdate(id, payload, { new: true, runValidators: true }),
};

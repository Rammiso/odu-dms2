import { maintenanceService } from "../services/maintenanceService.js";
import { auditService } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const maintenanceController = {
  getMaintenanceRequests: asyncHandler(async (req, res) => {
    const data = await maintenanceService.getRequests(req.query, req.user);
    res.status(200).json({ success: true, data });
  }),

  submitMaintenanceRequest: asyncHandler(async (req, res) => {
    const data = await maintenanceService.submit(req.user.id, req.body);
    
    auditService.log({
      user: req.user.id,
      action: "CREATE",
      entity: "MaintenanceRequest",
      entityId: data._id || data.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data });
  }),

  getAssignedRequests: asyncHandler(async (req, res) => {
    const data = await maintenanceService.getAssigned(req.user.id);
    res.status(200).json({ success: true, data });
  }),

  updateMaintenanceStatus: asyncHandler(async (req, res) => {
    const data = await maintenanceService.updateStatus(req.params.requestId, req.body);
    
    auditService.log({
      user: req.user.id,
      action: "UPDATE",
      entity: "MaintenanceRequest",
      entityId: req.params.requestId,
      details: "Updated status",
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data });
  }),

  addMaintenanceNote: asyncHandler(async (req, res) => {
    const data = await maintenanceService.addNote(req.params.requestId, req.body, req.user.id);
    
    auditService.log({
      user: req.user.id,
      action: "UPDATE",
      entity: "MaintenanceRequest",
      entityId: req.params.requestId,
      details: "Added note",
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data });
  }),

  reassignMaintenanceRequest: asyncHandler(async (req, res) => {
    const data = await maintenanceService.reassign(req.params.requestId, req.body);
    
    auditService.log({
      user: req.user.id,
      action: "UPDATE",
      entity: "MaintenanceRequest",
      entityId: req.params.requestId,
      details: "Reassigned staff",
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data });
  }),
};

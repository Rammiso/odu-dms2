import { roomChangeService } from "../services/roomChangeService.js";
import { auditService } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const roomChangeController = {
  getMyRoomChangeRequests: asyncHandler(async (req, res) => {
    const data = await roomChangeService.getMyRequests(req.user.id);
    res.status(200).json({ success: true, data });
  }),

  submitRoomChangeRequest: asyncHandler(async (req, res) => {
    console.log(`[room-change] POST submit - user=${req.user.id} role=${req.user.role}`);
    const result = await roomChangeService.submit(req.user.id, req.body);
    console.log(`[room-change] POST submit - success, request created`);
    res.status(201).json({ success: true, data: result });
  }),

  getPendingRoomChangeRequests: asyncHandler(async (req, res) => {
    const data = await roomChangeService.getPending();
    res.status(200).json({ success: true, data });
  }),

  approveRoomChange: asyncHandler(async (req, res) => {
    const assignment = await roomChangeService.approve(req.params.requestId, req.body, req.user.id);
    
    auditService.log({
      user: req.user.id,
      action: "APPROVE",
      entity: "RoomChange",
      entityId: req.params.requestId,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: assignment });
  }),

  rejectRoomChange: asyncHandler(async (req, res) => {
    const result = await roomChangeService.reject(req.params.requestId, req.body, req.user.id);
    
    auditService.log({
      user: req.user.id,
      action: "REJECT",
      entity: "RoomChange",
      entityId: req.params.requestId,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: result });
  }),
};

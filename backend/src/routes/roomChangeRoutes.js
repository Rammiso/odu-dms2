import { Router } from "express";

import { roomChangeController } from "../controllers/roomChangeController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/room-change-requests",
  requireAuth,
  authorizeRoles("Student"),
  roomChangeController.getMyRoomChangeRequests
);

router.post(
  "/room-change-requests",
  requireAuth,
  authorizeRoles("Student"),
  roomChangeController.submitRoomChangeRequest
);

router.get(
  "/room-change-requests/pending",
  requireAuth,
  authorizeRoles("Dorm Admin", "Management", "System Admin"),
  roomChangeController.getPendingRoomChangeRequests
);

router.put(
  "/room-change-requests/:requestId/approve",
  requireAuth,
  authorizeRoles("Dorm Admin", "System Admin"),
  roomChangeController.approveRoomChange
);

router.put(
  "/room-change-requests/:requestId/reject",
  requireAuth,
  authorizeRoles("Dorm Admin", "System Admin"),
  roomChangeController.rejectRoomChange
);

export { router as roomChangeRoutes };

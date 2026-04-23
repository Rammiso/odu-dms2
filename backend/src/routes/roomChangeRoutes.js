import { Router } from "express";

import { roomChangeController } from "../controllers/roomChangeController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../validators/index.js";
import {
  submitRoomChangeSchema,
  approveRoomChangeSchema,
  rejectRoomChangeSchema,
} from "../validators/roomChangeValidator.js";

const router = Router();

router.get(
  "/room-change-requests",
  requireAuth,
  authorizeRoles("student", "dorm_admin", "management", "system_admin"),
  roomChangeController.getMyRoomChangeRequests
);

router.post(
  "/room-change-requests",
  requireAuth,
  authorizeRoles("student"),
  validate(submitRoomChangeSchema),
  roomChangeController.submitRoomChangeRequest
);

router.get(
  "/room-change-requests/pending",
  requireAuth,
  authorizeRoles("dorm_admin", "management", "system_admin"),
  roomChangeController.getPendingRoomChangeRequests
);

router.put(
  "/room-change-requests/:requestId/approve",
  requireAuth,
  authorizeRoles("dorm_admin", "system_admin"),
  validate(approveRoomChangeSchema),
  roomChangeController.approveRoomChange
);

router.put(
  "/room-change-requests/:requestId/reject",
  requireAuth,
  authorizeRoles("dorm_admin", "system_admin"),
  validate(rejectRoomChangeSchema),
  roomChangeController.rejectRoomChange
);

export { router as roomChangeRoutes };

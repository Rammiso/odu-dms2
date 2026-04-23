import { Router } from "express";

import { maintenanceController } from "../controllers/maintenanceController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../validators/index.js";
import {
  submitMaintenanceSchema,
  updateStatusSchema,
  addNoteSchema,
  reassignSchema,
} from "../validators/maintenanceValidator.js";

const router = Router();

router.get(
  "/maintenance-requests",
  requireAuth,
  authorizeRoles("student", "dorm_admin", "maintenance", "management", "system_admin"),
  maintenanceController.getMaintenanceRequests
);

router.post("/maintenance-requests", requireAuth, validate(submitMaintenanceSchema), maintenanceController.submitMaintenanceRequest);

router.get(
  "/maintenance-requests/assigned",
  requireAuth,
  authorizeRoles("maintenance"),
  maintenanceController.getAssignedRequests
);

router.put(
  "/maintenance-requests/:requestId/status",
  requireAuth,
  authorizeRoles("maintenance", "dorm_admin", "system_admin"),
  validate(updateStatusSchema),
  maintenanceController.updateMaintenanceStatus
);

router.post(
  "/maintenance-requests/:requestId/notes",
  requireAuth,
  authorizeRoles("maintenance", "dorm_admin", "system_admin"),
  validate(addNoteSchema),
  maintenanceController.addMaintenanceNote
);

router.put(
  "/maintenance-requests/:requestId/reassign",
  requireAuth,
  authorizeRoles("dorm_admin", "system_admin"),
  validate(reassignSchema),
  maintenanceController.reassignMaintenanceRequest
);

export { router as maintenanceRoutes };

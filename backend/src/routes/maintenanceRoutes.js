import { Router } from "express";

import { maintenanceController } from "../controllers/maintenanceController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/maintenance-requests",
  requireAuth,
  authorizeRoles("Dorm Admin", "Maintenance Staff", "Management", "System Admin"),
  maintenanceController.getMaintenanceRequests
);

router.post("/maintenance-requests", requireAuth, maintenanceController.submitMaintenanceRequest);

router.get(
  "/maintenance-requests/assigned",
  requireAuth,
  authorizeRoles("Maintenance Staff"),
  maintenanceController.getAssignedRequests
);

router.put(
  "/maintenance-requests/:requestId/status",
  requireAuth,
  authorizeRoles("Maintenance Staff", "Dorm Admin", "System Admin"),
  maintenanceController.updateMaintenanceStatus
);

router.post(
  "/maintenance-requests/:requestId/notes",
  requireAuth,
  authorizeRoles("Maintenance Staff", "Dorm Admin", "System Admin"),
  maintenanceController.addMaintenanceNote
);

router.put(
  "/maintenance-requests/:requestId/reassign",
  requireAuth,
  authorizeRoles("Dorm Admin", "System Admin"),
  maintenanceController.reassignMaintenanceRequest
);

export { router as maintenanceRoutes };

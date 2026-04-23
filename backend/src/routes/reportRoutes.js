import { Router } from "express";

import { reportController } from "../controllers/reportController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

const adminAuth = [requireAuth, authorizeRoles("dorm_admin", "management", "system_admin")];

router.get("/reports/dashboard-summary", ...adminAuth, reportController.getDashboardSummary);
router.get("/reports/occupancy", ...adminAuth, reportController.getOccupancyReport);
router.get("/reports/student-directory", ...adminAuth, reportController.getStudentDirectory);
router.get("/reports/maintenance-summary", ...adminAuth, reportController.getMaintenanceSummary);
router.get("/reports/room-utilization", ...adminAuth, reportController.getRoomUtilization);
router.get("/reports/unassigned-students", ...adminAuth, reportController.getUnassignedStudentsReport);
router.get("/reports/inventory-condition", ...adminAuth, reportController.getInventoryConditionReport);
router.post("/reports/export", ...adminAuth, reportController.exportReport);

export { router as reportRoutes };

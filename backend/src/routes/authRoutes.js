import { Router } from "express";






















export { router as reportRoutes };router.post("/reports/export", reportController.exportReport);router.get("/reports/inventory-condition", reportController.getInventoryConditionReport);router.get("/reports/unassigned-students", reportController.getUnassignedStudentsReport);router.get("/reports/room-utilization", reportController.getRoomUtilization);router.get("/reports/maintenance-summary", reportController.getMaintenanceSummary);router.get("/reports/student-directory", reportController.getStudentDirectory);router.get("/reports/occupancy", reportController.getOccupancyReport);router.get("/reports/dashboard-summary", reportController.getDashboardSummary););  authorizeRoles("Dorm Admin", "Management", "System Admin")  requireAuth,router.use(const router = Router();import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";import { reportController } from "../controllers/reportController.js";import { authController } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", authController.login);
router.post("/logout", requireAuth, authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/validate-session", requireAuth, authController.validateSession);

export { router as authRoutes };

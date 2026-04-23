import { Router } from "express";

import { studentController } from "../controllers/studentController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

const studentAuth = [requireAuth, authorizeRoles("student")];

router.get("/student/assignment", ...studentAuth, studentController.getMyAssignment);
router.get("/student/maintenance-requests", ...studentAuth, studentController.getMyMaintenanceRequests);
router.get("/student/profile", ...studentAuth, studentController.getStudentProfile);

export { router as studentRoutes };

import { Router } from "express";

import { allocationController } from "../controllers/allocationController.js";
import { roomController } from "../controllers/roomController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../validators/index.js";
import {
  eligibleStudentsSchema,
  autoAllocateSchema,
  manualAllocateSchema,
} from "../validators/allocationValidator.js";

const router = Router();

const adminAuth = [requireAuth, authorizeRoles("dorm_admin", "management", "system_admin")];

router.post("/allocation/eligible-students", ...adminAuth, validate(eligibleStudentsSchema), allocationController.getEligibleStudents);
router.post("/allocation/automatic", ...adminAuth, validate(autoAllocateSchema), allocationController.autoAllocate);
router.post("/allocation/manual", ...adminAuth, validate(manualAllocateSchema), allocationController.manualAllocate);
router.get("/students/unassigned", ...adminAuth, roomController.getUnassignedStudents);
router.delete("/assignments/:assignmentId/vacate", ...adminAuth, allocationController.vacateRoom);

export { router as allocationRoutes };

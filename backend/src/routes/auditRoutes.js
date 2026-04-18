import { Router } from "express";

import { auditController } from "../controllers/auditController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(requireAuth, authorizeRoles("System Admin"));

router.get("/audit-logs", auditController.getAuditLogs);
router.get("/audit-logs/export", auditController.exportAuditLogs);

export { router as auditRoutes };

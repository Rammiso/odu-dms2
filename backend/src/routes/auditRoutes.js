import { Router } from "express";

import { auditController } from "../controllers/auditController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

const auditAuth = [requireAuth, authorizeRoles("system_admin", "management")];

router.get("/audit-logs", ...auditAuth, auditController.getAuditLogs);
router.get("/audit-logs/export", ...auditAuth, auditController.exportAuditLogs);

export { router as auditRoutes };

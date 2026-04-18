import { Router } from "express";

import { allocationRoutes } from "./allocationRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { auditRoutes } from "./auditRoutes.js";
import { healthRoutes } from "./healthRoutes.js";
import { inventoryRoutes } from "./inventoryRoutes.js";
import { maintenanceRoutes } from "./maintenanceRoutes.js";
import { notificationRoutes } from "./notificationRoutes.js";
import { reportRoutes } from "./reportRoutes.js";
import { roomChangeRoutes } from "./roomChangeRoutes.js";
import { roomRoutes } from "./roomRoutes.js";
import { studentRoutes } from "./studentRoutes.js";
import { userRoutes } from "./userRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use(studentRoutes);
router.use(roomRoutes);
router.use(allocationRoutes);
router.use(roomChangeRoutes);
router.use(maintenanceRoutes);
router.use(inventoryRoutes);
router.use(reportRoutes);
router.use(userRoutes);
router.use(notificationRoutes);
router.use(auditRoutes);

export { router as appRouter };

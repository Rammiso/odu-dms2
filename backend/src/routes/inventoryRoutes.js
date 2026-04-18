import { Router } from "express";

import { inventoryController } from "../controllers/inventoryController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(
  requireAuth,
  authorizeRoles("Dorm Admin", "Maintenance Staff", "Management", "System Admin")
);

router.get("/inventory/furniture/room/:roomId", inventoryController.getRoomFurniture);
router.post("/inventory/furniture", inventoryController.addFurniture);
router.put("/inventory/furniture/:itemId", inventoryController.updateFurniture);
router.post("/inventory/linen/issue", inventoryController.issueLinen);
router.post("/inventory/linen/return", inventoryController.returnLinen);
router.post("/inventory/keys/issue", inventoryController.issueKey);
router.post("/inventory/keys/return", inventoryController.returnKey);
router.get("/inventory/keys/missing", inventoryController.getMissingKeys);

export { router as inventoryRoutes };

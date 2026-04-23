import { Router } from "express";

import { inventoryController } from "../controllers/inventoryController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../validators/index.js";
import {
  addFurnitureSchema,
  updateFurnitureSchema,
  issueLinenSchema,
  returnLinenSchema,
  issueKeySchema,
  returnKeySchema,
} from "../validators/inventoryValidator.js";

const router = Router();

const adminAuth = [requireAuth, authorizeRoles("dorm_admin", "maintenance", "management", "system_admin")];

router.get("/inventory/furniture/room/:roomId", ...adminAuth, inventoryController.getRoomFurniture);
router.post("/inventory/furniture", ...adminAuth, validate(addFurnitureSchema), inventoryController.addFurniture);
router.put("/inventory/furniture/:itemId", ...adminAuth, validate(updateFurnitureSchema), inventoryController.updateFurniture);
router.post("/inventory/linen/issue", ...adminAuth, validate(issueLinenSchema), inventoryController.issueLinen);
router.post("/inventory/linen/return", ...adminAuth, validate(returnLinenSchema), inventoryController.returnLinen);
router.post("/inventory/keys/issue", ...adminAuth, validate(issueKeySchema), inventoryController.issueKey);
router.post("/inventory/keys/return", ...adminAuth, validate(returnKeySchema), inventoryController.returnKey);
router.get("/inventory/keys/missing", ...adminAuth, inventoryController.getMissingKeys);

export { router as inventoryRoutes };

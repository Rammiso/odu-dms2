import { Router } from "express";

import { roomController } from "../controllers/roomController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../validators/index.js";
import {
  createDormSchema,
  addFloorSchema,
  createRoomSchema,
  updateRoomSchema,
} from "../validators/roomValidator.js";

const router = Router();

// Available rooms — accessible by all authenticated users
router.get("/rooms/available", requireAuth, roomController.getAvailableRooms);

// Admin-only routes
const adminAuth = [requireAuth, authorizeRoles("dorm_admin", "management", "system_admin")];

router.get("/dorms", ...adminAuth, roomController.getAllDorms);
router.post("/dorms", ...adminAuth, validate(createDormSchema), roomController.createDorm);
router.post("/dorms/:dormId/floors", ...adminAuth, validate(addFloorSchema), roomController.addFloor);

router.get("/rooms", ...adminAuth, roomController.getRooms);
router.post("/rooms", ...adminAuth, validate(createRoomSchema), roomController.createRoom);
router.get("/rooms/:roomId", ...adminAuth, roomController.getRoom);
router.put("/rooms/:roomId", ...adminAuth, validate(updateRoomSchema), roomController.updateRoom);
router.get("/rooms/:roomId/occupants", ...adminAuth, roomController.getRoomOccupants);

export { router as roomRoutes };

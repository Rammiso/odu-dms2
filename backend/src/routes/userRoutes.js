import { Router } from "express";

import { userController } from "../controllers/userController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(requireAuth, authorizeRoles("System Admin"));

router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
router.get("/users/:userId", userController.getUser);
router.put("/users/:userId", userController.updateUser);
router.post("/users/:userId/deactivate", userController.deactivateUser);
router.post("/users/:userId/reactivate", userController.reactivateUser);
router.post("/users/:userId/reset-password", userController.adminResetPassword);
router.get("/roles/permissions", userController.getRolePermissions);

export { router as userRoutes };

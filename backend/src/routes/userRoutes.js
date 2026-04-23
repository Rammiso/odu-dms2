import { Router } from "express";

import { userController } from "../controllers/userController.js";
import { authorizeRoles, requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../validators/index.js";
import { createUserSchema, updateUserSchema } from "../validators/userValidator.js";

const router = Router();

const sysAdmin = [requireAuth, authorizeRoles("system_admin")];

router.get("/users", ...sysAdmin, userController.getUsers);
router.post("/users", ...sysAdmin, validate(createUserSchema), userController.createUser);
router.get("/users/:userId", ...sysAdmin, userController.getUser);
router.put("/users/:userId", ...sysAdmin, validate(updateUserSchema), userController.updateUser);
router.post("/users/:userId/deactivate", ...sysAdmin, userController.deactivateUser);
router.post("/users/:userId/reactivate", ...sysAdmin, userController.reactivateUser);
router.post("/users/:userId/reset-password", ...sysAdmin, userController.adminResetPassword);
router.get("/roles/permissions", requireAuth, userController.getRolePermissions);

export { router as userRoutes };

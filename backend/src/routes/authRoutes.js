import { Router } from "express";

import { authController } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.registerStudent);
router.post("/logout", requireAuth, authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/validate-session", requireAuth, authController.validateSession);
router.post("/refresh", authController.refreshToken);

export { router as authRoutes };

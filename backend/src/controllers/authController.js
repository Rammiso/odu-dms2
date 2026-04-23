import { authService } from "../services/authService.js";
import { auditService } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authController = {
  login: asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);
    
    // Fire and forget audit log
    auditService.log({
      user: data.user.id,
      action: "LOGIN",
      entity: "User",
      entityId: data.user.id,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      ...data,
    });
  }),

  registerStudent: asyncHandler(async (req, res) => {
    const data = await authService.registerStudent(req.body);
    
    auditService.log({
      user: data.user.id,
      action: "CREATE",
      entity: "Student",
      entityId: data.student.id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      ...data,
    });
  }),

  logout: asyncHandler(async (req, res) => {
    const data = await authService.logout(req.user?.id);
    
    if (req.user?.id) {
      auditService.log({
        user: req.user.id,
        action: "LOGOUT",
        entity: "User",
        entityId: req.user.id,
        ipAddress: req.ip,
      });
    }

    res.status(200).json({ success: true, ...data });
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const data = await authService.forgotPassword(req.body);
    res.status(200).json({ success: true, ...data });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const data = await authService.resetPassword(req.body);
    res.status(200).json({ success: true, ...data });
  }),

  validateSession: asyncHandler(async (req, res) => {
    const data = await authService.validateSession(req.user.id);
    res.status(200).json(data);
  }),

  refreshToken: asyncHandler(async (req, res) => {
    const data = await authService.refreshToken(req.body.token);
    res.status(200).json({ success: true, ...data });
  }),
};

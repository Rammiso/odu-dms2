import { authService } from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authController = {
  register: asyncHandler(async (req, res) => {
    const data = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data,
    });
  }),

  login: asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  }),
};

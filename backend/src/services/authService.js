import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { tokenRepository } from "../repositories/tokenRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { studentRepository } from "../repositories/studentRepository.js";
import { ApiError } from "../utils/ApiError.js";

const generateToken = (userId, role) =>
  jwt.sign({ sub: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

export const authService = {
  login: async (payload) => {
    if (!payload.username || !payload.password) {
      throw new ApiError(400, "username and password are required");
    }

    const user = await userRepository.findByUsername(payload.username, {
      includePassword: true,
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await user.comparePassword(payload.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user.id, user.role);
    const refreshToken = crypto.randomBytes(48).toString("hex");
    await tokenRepository.createRefreshToken({
      user: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return {
      token,
      refreshToken,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  },

  registerStudent: async (payload) => {
    const email = payload.email?.toLowerCase().trim();
    if (!email || !email.endsWith("@odu.edu.et")) {
      throw new ApiError(400, "Registration requires a valid @odu.edu.et university email");
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(400, "Email already registered");
    }

    const existingPhone = await studentRepository.findByPhone(payload.phone);
    if (existingPhone) {
      throw new ApiError(400, "Phone number already registered");
    }

    const existingStudentId = await studentRepository.findByStudentId(payload.studentId);
    if (existingStudentId) {
      throw new ApiError(400, "Student ID already registered");
    }

    const username = email.split("@")[0];
    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new ApiError(400, "Username derived from email is already in use");
    }

    const fullName = `${payload.firstName} ${payload.lastName}`.trim();

    const newUser = await userRepository.create({
      username,
      fullName,
      email,
      password: payload.password,
      role: "Student",
      studentId: payload.studentId,
    });

    const newStudent = await studentRepository.create({
      studentId: payload.studentId,
      fullName,
      gender: payload.gender,
      department: payload.department,
      year: payload.year,
      phone: payload.phone,
      email,
      user: newUser.id,
    });

    return {
      message: "Registration successful",
      user: { id: newUser.id, username, email, role: "Student" },
      student: { id: newStudent.id, studentId: newStudent.studentId },
    };
  },

  logout: async () => ({ message: "Logout successful" }),

  forgotPassword: async (payload) => {
    if (!payload.identifier && !payload.email) {
      throw new ApiError(400, "Email or phone number is required");
    }

    const identifier = payload.identifier || payload.email;
    let user;

    if (identifier.includes("@")) {
      user = await userRepository.findByEmail(identifier.toLowerCase().trim());
    } else {
      const student = await studentRepository.findByPhone(identifier.trim());
      if (student && student.user) {
        user = await userRepository.findById(student.user._id || student.user);
      }
    }

    if (!user) {
      return { message: "Reset link sent if account exists" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    await tokenRepository.createPasswordResetToken({
      user: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    return { message: "Reset link sent if email exists" };
  },

  resetPassword: async (payload) => {
    if (!payload.token || !payload.newPassword) {
      throw new ApiError(400, "token and newPassword are required");
    }

    const resetToken = await tokenRepository.findValidPasswordResetToken(payload.token);
    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    await userRepository.updatePassword(resetToken.user, payload.newPassword);
    await tokenRepository.markPasswordTokenUsed(resetToken.id);

    return { message: "Password reset successful" };
  },

  validateSession: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(401, "Session invalid");
    }

    return {
      valid: true,
      role: user.role,
    };
  },

  refreshToken: async (token) => {
    if (!token) throw new ApiError(400, "Refresh token is required");

    const record = await tokenRepository.findRefreshToken(token);
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findById(record.user);
    if (!user) throw new ApiError(401, "User not found");

    const newToken = generateToken(user.id, user.role);
    return { token: newToken };
  },
};

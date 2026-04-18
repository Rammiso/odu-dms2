import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { userRepository } from "../repositories/userRepository.js";
import { ApiError } from "../utils/ApiError.js";
import {
  validateLoginInput,
  validateRegistrationInput,
} from "../validators/authValidator.js";

const generateToken = (userId, role) =>
  jwt.sign({ sub: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

export const authService = {
  register: async (payload) => {
    validateRegistrationInput(payload);

    const existingUser = await userRepository.findByEmail(payload.email.toLowerCase());
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await userRepository.create({
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      password: hashedPassword,
      role: payload.role,
    });

    const token = generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  },

  login: async (payload) => {
    validateLoginInput(payload);

    const user = await userRepository.findByEmail(payload.email.toLowerCase(), {
      includePassword: true,
    });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  },
};

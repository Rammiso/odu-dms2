import { ApiError } from "../utils/ApiError.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationInput = (payload) => {
  const { fullName, email, password } = payload;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "fullName, email and password are required");
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (String(password).length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }
};

export const validateLoginInput = (payload) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }
};

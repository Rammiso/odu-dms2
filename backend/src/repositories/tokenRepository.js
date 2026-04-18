import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { RefreshToken } from "../models/RefreshToken.js";

export const tokenRepository = {
  createRefreshToken: (payload) => RefreshToken.create(payload),
  findRefreshToken: (token) => RefreshToken.findOne({ token }).select("+token"),
  revokeRefreshToken: (token) =>
    RefreshToken.findOneAndUpdate(token, { revokedAt: new Date() }, { new: true }),

  createPasswordResetToken: (payload) => PasswordResetToken.create(payload),
  findValidPasswordResetToken: (token) =>
    PasswordResetToken.findOne({ token, usedAt: null }).select("+token"),
  markPasswordTokenUsed: (id) =>
    PasswordResetToken.findByIdAndUpdate(id, { usedAt: new Date() }, { new: true }),
};

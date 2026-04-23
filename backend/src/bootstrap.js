import { User } from "./models/User.js";
import { ADMIN_CREDENTIALS } from "./config/constants.js";
import { logger } from "./utils/logger.js";

/**
 * Runs on every server startup.
 * Creates the System Admin account if it doesn't already exist.
 * Safe to run repeatedly — never overwrites existing data.
 * NOTE: pass plain-text password — the User pre('save') hook hashes it.
 */
export const ensureAdminExists = async () => {
  try {
    const existing = await User.findOne({ username: ADMIN_CREDENTIALS.username });

    if (existing) {
      logger.info(`Bootstrap: admin "${ADMIN_CREDENTIALS.username}" already exists — skipping.`);
      return;
    }

    // Plain-text password — the pre('save') bcrypt hook will hash it
    await User.create({
      fullName: ADMIN_CREDENTIALS.fullName,
      username: ADMIN_CREDENTIALS.username,
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      role: ADMIN_CREDENTIALS.role,
      status: "Active",
    });

    logger.info("Bootstrap: System Admin created successfully.");
    logger.info(`  Username : ${ADMIN_CREDENTIALS.username}`);
    logger.info(`  Email    : ${ADMIN_CREDENTIALS.email}`);
    logger.info(`  Role     : ${ADMIN_CREDENTIALS.role}`);
  } catch (err) {
    // Log but don't crash the server — admin may already exist with a unique-key conflict
    logger.error("Bootstrap: failed to ensure admin exists:", err.message);
  }
};

import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["MONGO_URI", "JWT_SECRET"];

for (const variableName of requiredVars) {
  if (!process.env[variableName]) {
    throw new Error(`${variableName} is required in environment variables`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === "production" ? "https://your-vercel-app.vercel.app" : "*"),
};

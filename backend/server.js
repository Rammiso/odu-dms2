import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { connectDatabase } from "./src/config/database.js";
import { env } from "./src/config/env.js";
import { errorHandler } from "./src/middlewares/errorMiddleware.js";
import { notFoundHandler } from "./src/middlewares/notFoundMiddleware.js";
import { appRouter } from "./src/routes/index.js";
import { logger } from "./src/utils/logger.js";
import { ensureAdminExists } from "./src/bootstrap.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
// Enhanced CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow multiple origins
    const allowedOrigins = env.corsOrigin === "*" 
      ? "*" 
      : env.corsOrigin.split(",").map(o => o.trim());
    
    if (allowedOrigins === "*" || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Handle preflight requests before authentication middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);
app.use("/api", appRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();
  await ensureAdminExists();

  app.listen(env.port, () => {
    logger.info(`DMS API listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  logger.error("Failed to bootstrap server", error);
  process.exit(1);
});

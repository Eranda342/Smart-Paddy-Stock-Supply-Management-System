/**
 * Structured logger (Winston).
 * Outputs JSON-formatted logs with timestamps.
 *
 * Usage:
 *   const logger = require("../utils/logger");
 *   logger.info("Server started", { port: 5000 });
 *   logger.warn("Image validation failed", { value: image });
 *   logger.error("DB connection failed", { error: err.message });
 *
 * Apply minimally — do NOT replace all console.log calls at once.
 * Only swap in for critical paths (auth, image validation, etc.).
 */
const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      // Pretty-print in development, JSON in production
      format:
        process.env.NODE_ENV === "production"
          ? format.json()
          : format.combine(
              format.colorize(),
              format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length
                  ? " " + JSON.stringify(meta)
                  : "";
                return `${timestamp} [${level}]: ${message}${metaStr}`;
              })
            ),
    }),
  ],
});

module.exports = logger;

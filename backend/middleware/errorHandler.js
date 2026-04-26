/**
 * Global Express error handler.
 * Catches any error passed to next(err) from any route.
 * Must be registered LAST in server.js (after all routes).
 *
 * Keeps the response shape consistent:
 *   { success: false, message: "..." }
 *
 * No breaking change — existing routes that respond manually
 * before throwing will never reach this handler.
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error server-side
  console.error("🔥 UNHANDLED ERROR:", {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });

  const status = err.statusCode || err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;

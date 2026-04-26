/**
 * asyncHandler — wraps an async route handler so that any rejected
 * promise or thrown error is forwarded to Express's next(err),
 * which is then caught by the global errorHandler middleware.
 *
 * Usage:
 *   router.post("/login", asyncHandler(loginUser));
 *
 * This removes the need for try/catch in every controller.
 * Apply ONLY to new or low-risk routes first; do NOT mass-replace
 * existing try/catch blocks unless each one is verified safe.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

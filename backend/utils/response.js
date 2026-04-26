/**
 * Standardized response helpers.
 *
 * Keeps API responses consistent:
 *   success → { success: true, data, message }
 *   failure → { success: false, message }
 *
 * These are OPTIONAL helpers — existing res.json() calls
 * are NOT broken. Apply only to new or updated endpoints.
 *
 * Usage:
 *   const { success, failure } = require("../utils/response");
 *   return success(res, user, "Login successful");
 *   return failure(res, "User not found", 404);
 */

const success = (res, data = null, message = "", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const failure = (res, message = "An error occurred", status = 400) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

module.exports = { success, failure };

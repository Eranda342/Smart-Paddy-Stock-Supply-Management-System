/**
 * Validates that a given URL is a genuine Cloudinary secure_url.
 *
 * Cloudinary always returns URLs in the form:
 *   https://res.cloudinary.com/<cloud_name>/image/upload/...
 *
 * Any other string (local filenames, http-only URLs, accidental paths, etc.)
 * is considered invalid and must be rejected before persistence.
 *
 * @param {*} url - The value to validate.
 * @returns {boolean} true only for valid Cloudinary URLs.
 */
const isCloudinaryUrl = (url) => {
  return (
    typeof url === "string" &&
    url.includes("res.cloudinary.com")
  );
};

module.exports = { isCloudinaryUrl };

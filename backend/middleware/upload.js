const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const createStorage = (folderName, formats) => new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: folderName,
    allowed_formats: formats,
  },
});

const uploadAvatar = multer({
  storage: createStorage("agrobridge/avatars", ["jpg", "jpeg", "png", "webp"]),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadDocument = multer({
  storage: createStorage("agrobridge/documents", ["jpg", "jpeg", "png", "webp", "pdf"]),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadAttachment = multer({
  storage: createStorage("agrobridge/attachments", ["jpg", "jpeg", "png", "webp", "pdf"]),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = {
  uploadAvatar,
  uploadDocument,
  uploadAttachment
};
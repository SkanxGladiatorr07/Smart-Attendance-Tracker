import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed File Types & Extensions
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg']);

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const fieldPrefix = file.fieldname ? file.fieldname.toLowerCase() : 'doc';
    cb(null, `${fieldPrefix}-${uniqueSuffix}${ext}`);
  }
});

// File Filter Function for MIME & Extension Validation
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  const isMimeValid = ALLOWED_MIME_TYPES.has(mimeType);
  const isExtValid = ALLOWED_EXTENSIONS.has(ext);

  if (isMimeValid && isExtValid) {
    return cb(null, true);
  }

  const error = new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed.');
  error.statusCode = 400;
  return cb(error, false);
};

// Multer Instance with 15MB Size Limit
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 Megabytes
  }
});

/**
 * Middleware factory wrapper to execute Multer upload and handle errors cleanly
 * @param {string[]} fieldNames - Acceptable file field names (e.g. ['calendar', 'file'] or ['timetable', 'file'])
 */
export const createSingleUploadMiddleware = (fieldNames = ['file']) => {
  return (req, res, next) => {
    // Try matching field name from request or default to primary field
    const primaryField = fieldNames[0];

    const uploadSingle = upload.single(primaryField);

    uploadSingle(req, res, (err) => {
      // 1. Handle Multer-specific errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'fail',
            message: 'File size limit exceeded. Maximum file size allowed is 15MB.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            status: 'fail',
            message: `Unexpected file field "${err.field}". Allowed field name is "${primaryField}".`
          });
        }
        return res.status(400).json({
          status: 'fail',
          message: `File upload error: ${err.message}`
        });
      }

      // 2. Handle Custom Validation Error (e.g., Invalid MIME type)
      if (err) {
        return res.status(err.statusCode || 400).json({
          status: 'fail',
          message: err.message || 'File upload failed validation.'
        });
      }

      // 3. Handle Missing File Error
      if (!req.file) {
        return res.status(400).json({
          status: 'fail',
          message: `No file uploaded. Please attach a file using the form field "${primaryField}".`
        });
      }

      // Proceed to controller handler
      next();
    });
  };
};

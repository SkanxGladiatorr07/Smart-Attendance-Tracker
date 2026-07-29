/**
 * Controller to handle Academic Calendar document upload
 * POST /upload/calendar
 */
export const uploadCalendar = async (req, res, next) => {
  try {
    const file = req.file;

    const fileMetadata = {
      fieldName: file.fieldname,
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      filePath: file.path,
      url: `/uploads/${file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    return res.status(201).json({
      status: 'success',
      message: 'Academic Calendar uploaded successfully.',
      data: fileMetadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle Weekly Timetable document upload
 * POST /upload/timetable
 */
export const uploadTimetable = async (req, res, next) => {
  try {
    const file = req.file;

    const fileMetadata = {
      fieldName: file.fieldname,
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      filePath: file.path,
      url: `/uploads/${file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    return res.status(201).json({
      status: 'success',
      message: 'Weekly Timetable uploaded successfully.',
      data: fileMetadata
    });
  } catch (error) {
    next(error);
  }
};

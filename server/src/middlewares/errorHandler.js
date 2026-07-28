/**
 * Global Express error handling middleware
 * Automatically intercepts operational AppErrors, DB errors, and unhandled exceptions.
 */
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle MySQL Duplicate Entry Errors (e.g., ER_DUP_ENTRY / 1062)
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    statusCode = 409;
    message = 'Duplicate entry error: A record with this unique key already exists.';
  }

  // Handle Foreign Key Constraint Failures (e.g., ER_NO_REFERENCED_ROW_2 / 1452)
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    statusCode = 400;
    message = 'Invalid reference: The referenced parent entity does not exist.';
  }

  // Handle Delete Parent Foreign Key Failures (e.g., ER_ROW_IS_REFERENCED_2 / 1451)
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
    statusCode = 400;
    message = 'Cannot delete or update entity because dependent child records exist.';
  }

  const isOperational = statusCode >= 400 && statusCode < 500;
  const status = isOperational ? 'fail' : 'error';

  if (!isOperational) {
    console.error(`[Unhandled Server Error] ${err.stack || err}`);
  } else {
    console.warn(`[Client Request ${status.toUpperCase()}] ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

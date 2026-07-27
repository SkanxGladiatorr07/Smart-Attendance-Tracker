/**
 * Global Express error handling middleware
 */
export const errorHandler = (err, req, res, _next) => {
  console.error(`[Error] ${err.message}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

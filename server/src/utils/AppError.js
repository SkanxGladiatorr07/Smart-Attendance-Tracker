/**
 * @file AppError.js
 * @description Custom operational error class for structured HTTP error responses.
 * Attach a `statusCode` to any thrown error to have the global `errorHandler`
 * respond with the appropriate HTTP status instead of a generic 500.
 *
 * Errors with `isOperational = true` are user-facing (4xx) and are logged as warnings.
 * Errors with `isOperational = false` are unexpected server errors (5xx) and are logged as stack traces.
 */

/**
 * Operational HTTP error with a structured status code.
 *
 * @extends Error
 * @param {string} message - Human-readable error description
 * @param {number} statusCode - HTTP status code (e.g. 400, 404, 409, 500)
 *
 * @example
 * throw new AppError('Lecture not found', 404);
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    /** 'fail' for 4xx client errors, 'error' for 5xx server errors */
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    /** Marks this as an expected operational error (not a programming bug) */
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

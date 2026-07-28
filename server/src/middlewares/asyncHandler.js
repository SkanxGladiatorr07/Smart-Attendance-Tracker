/**
 * Express Async Handler Higher-Order Wrapper
 * Catches asynchronous errors in controller handlers and forwards them to next(err) middleware automatically.
 * Eliminates repetitive try/catch boilerplate.
 *
 * @param {Function} fn - Async controller middleware function
 * @returns {Function} Wrapped Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

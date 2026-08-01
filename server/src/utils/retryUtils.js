/**
 * Server-Side Retry & Resilience Helper
 * Executes an async operation with exponential backoff and jitter.
 *
 * @param {Function} fn - Async operation function
 * @param {Object} [options={}] - Retry options
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @param {number} [options.delayMs=1000] - Initial delay in milliseconds
 * @param {number} [options.backoffFactor=2] - Exponential multiplier
 * @param {Function} [options.shouldRetry] - Custom predicate to test if error is retryable
 * @returns {Promise<any>} Result of operation
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffFactor = 2,
    shouldRetry = (err) => {
      // Default: retry on network timeouts, 5xx server errors, rate limits (429)
      const status = err.response?.status || err.statusCode;
      if (!status) return true; // Network / socket errors
      return status === 429 || (status >= 500 && status <= 599);
    },
  } = options;

  let lastError;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt > maxRetries || !shouldRetry(err)) {
        throw err;
      }

      // Add jitter (±20%) to avoid thundering herd
      const jitter = currentDelay * (0.8 + Math.random() * 0.4);
      console.warn(
        `[Retry Warning] Attempt ${attempt}/${maxRetries} failed (${err.message}). Retrying in ${Math.round(jitter)}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, jitter));
      currentDelay *= backoffFactor;
    }
  }

  throw lastError;
}

/**
 * @desc    Health status check endpoint
 * @route   GET /api/health
 * @access  Public
 */
export const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend Connected',
    system: 'AttendAI API Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

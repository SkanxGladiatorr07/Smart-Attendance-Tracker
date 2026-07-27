import app from './app.js';
import { config } from './config/environment.js';

const server = app.listen(config.port, () => {
  console.log(`⚡ AttendAI Backend API running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

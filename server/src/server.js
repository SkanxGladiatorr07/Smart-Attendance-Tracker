import app from './app.js';
import { config } from './config/environment.js';
import { testConnection } from './config/database.js';

const server = app.listen(config.port, async () => {
  console.log(`⚡ AttendAI Backend API running in ${config.nodeEnv} mode on port ${config.port}`);
  
  // Test MySQL Connection on startup
  await testConnection();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

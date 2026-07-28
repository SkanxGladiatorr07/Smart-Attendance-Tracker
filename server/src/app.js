import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/environment.js';
import healthRoutes from './routes/healthRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS setup
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/stats', statsRoutes);

// Catch-all route for unknown API endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server.`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;

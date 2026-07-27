import mysql from 'mysql2/promise';
import { config } from './environment.js';

// Create a connection pool for efficient database connection reuse
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Tests database connectivity on application startup.
 */
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`🛢️  MySQL Database connected successfully [Database: ${config.db.database}]`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`⚠️  MySQL Database connection test failed: ${error.message}`);
    console.warn(`👉  Ensure MySQL service is running on ${config.db.host}:${config.db.port} and database '${config.db.database}' exists.`);
    return false;
  }
};

export default pool;

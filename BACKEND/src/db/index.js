/**
 * Database Connection Handler
 */

const { Pool } = require('pg');
const config = require('../config/config');
const logger = require('../utils/logger');

// Create a connection pool
const pool = new Pool({
  user: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  ssl: config.database.ssl,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Test the connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

// Handle errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

module.exports = {
  /**
   * Connect to the database
   * @returns {Promise<void>}
   */
  connect: async () => {
    try {
      const client = await pool.connect();
      client.release();
      logger.info('Database connection test successful');
      return true;
    } catch (err) {
      logger.error('Error connecting to database:', err);
      throw err;
    }
  },
  
  /**
   * Disconnect from the database
   * @returns {Promise<void>}
   */
  disconnect: async () => {
    try {
      await pool.end();
      logger.info('Database pool has ended');
      return true;
    } catch (err) {
      logger.error('Error disconnecting from database:', err);
      throw err;
    }
  },
  
  /**
   * Execute a SQL query
   * @param {string} text - The SQL query text
   * @param {Array} params - The query parameters
   * @returns {Promise<Object>} - Query result
   */
  query: async (text, params) => {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug(`Executed query: ${text} - Duration: ${duration}ms - Rows: ${result.rowCount}`);
      return result;
    } catch (err) {
      logger.error(`Query error: ${text}`, err);
      throw err;
    }
  },
  
  /**
   * Get a client from the pool for transactions
   * @returns {Promise<Object>} - PostgreSQL client
   */
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds on query execution
    const timeout = setTimeout(() => {
      logger.error('A client has been checked out for too long.');
      logger.error(`The last executed query was: ${client.lastQuery}`);
    }, 5000);
    
    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    
    // Monkey patch the release method to clear the timeout
    client.release = () => {
      clearTimeout(timeout);
      return release.apply(client);
    };
    
    return client;
  }
};
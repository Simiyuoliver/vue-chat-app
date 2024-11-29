const mysql = require('mysql2/promise');
require('dotenv').config();

// First, create a connection without database selection
const createDbConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234'
    });

    // Create database if it doesn't exist
    await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'chat_app'}`);
    await connection.query(`CREATE DATABASE ${process.env.DB_NAME || 'chat_app'}`);
    console.log('Database created successfully');
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
};

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'chat_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Database initialization
const initDb = async () => {
  try {
    console.log('Starting database initialization...');
    
    // First create the database if it doesn't exist
    await createDbConnection();

    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    console.log('Creating messages table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create subscriptions table
    console.log('Creating subscriptions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        plan_type ENUM('basic', 'premium') NOT NULL,
        status ENUM('pending', 'active', 'cancelled') NOT NULL,
        payment_processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initDb,
  testConnection
};

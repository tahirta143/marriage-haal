const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shaadi_pro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDatabaseAndMigrations = async () => {
  try {
    // 1. Ensure database exists
    const rootConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'shaadi_pro'}\`;`);
    await rootConn.end();

    // 2. Test pool connection & run auto-migration column & table creation checks
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL Database:', process.env.DB_NAME || 'shaadi_pro');

    // Migration: Add city column to halls if missing
    try {
      await conn.query(`ALTER TABLE halls ADD COLUMN city VARCHAR(50) NOT NULL DEFAULT 'Lahore'`);
    } catch (mErr) {}

    // Migration: Add venue_type column to halls if missing
    try {
      await conn.query(`ALTER TABLE halls ADD COLUMN venue_type VARCHAR(50) NOT NULL DEFAULT 'Ballroom'`);
    } catch (mErr) {}

    // Migration: Add total_amount column to bookings if missing
    try {
      await conn.query(`ALTER TABLE bookings ADD COLUMN total_amount DECIMAL(12,2) DEFAULT 0.00`);
    } catch (mErr) {}

    // Migration: Add city column to vendors if missing
    try {
      await conn.query(`ALTER TABLE vendors ADD COLUMN city VARCHAR(50) NOT NULL DEFAULT 'Lahore'`);
    } catch (mErr) {}

    // Migration: Add starting_price column to vendors if missing
    try {
      await conn.query(`ALTER TABLE vendors ADD COLUMN starting_price DECIMAL(10,2) DEFAULT 25000.00`);
    } catch (mErr) {}

    // Migration: Add rating column to vendors if missing
    try {
      await conn.query(`ALTER TABLE vendors ADD COLUMN rating DECIMAL(3,2) DEFAULT 4.80`);
    } catch (mErr) {}

    // Migration: Add reviews column to vendors if missing
    try {
      await conn.query(`ALTER TABLE vendors ADD COLUMN reviews INT DEFAULT 50`);
    } catch (mErr) {}

    // Migration: Add gallery column to vendors if missing
    try {
      await conn.query(`ALTER TABLE vendors ADD COLUMN gallery JSON NULL`);
    } catch (mErr) {}

    // Migration: Ensure sub_venues table exists
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS sub_venues (
          id INT PRIMARY KEY AUTO_INCREMENT,
          hall_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          venue_type ENUM('Ballroom', 'Marquee', 'Lawn', 'Haveli', 'Courtyard', 'Rooftop', 'Suite') DEFAULT 'Ballroom',
          capacity_min INT DEFAULT 100,
          capacity_max INT DEFAULT 500,
          price_per_event DECIMAL(10,2) DEFAULT 150000.00,
          image_url VARCHAR(255) NULL,
          FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
        );
      `);
    } catch (mErr) {}

    // Migration: Ensure sub_services table exists
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS sub_services (
          id INT PRIMARY KEY AUTO_INCREMENT,
          category_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10,2) DEFAULT 15000.00,
          description TEXT,
          image_url VARCHAR(255) NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
      `);
    } catch (mErr) {}

    // Migration: Ensure sub_events table exists
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS sub_events (
          id INT PRIMARY KEY AUTO_INCREMENT,
          event_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        );
      `);
    } catch (mErr) {}

    conn.release();
  } catch (error) {
    console.warn('⚠️ MySQL Database Connection Notice:', error.message);
  }
};

initDatabaseAndMigrations();

module.exports = pool;

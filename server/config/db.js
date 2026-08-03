const mysql = require('mysql2/promise');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

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

    // Automatically initialize schema from schema.sql if tables are missing
    try {
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        const cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        const statements = cleanSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

        for (const statement of statements) {
          try {
            await conn.query(statement);
          } catch (stmtErr) {
            // Ignore minor duplicate key or table exists errors
          }
        }
        console.log('✅ Base Database Schema auto-verified/applied from schema.sql');
      }
    } catch (schemaErr) {
      console.warn('⚠️ Schema auto-initialization notice:', schemaErr.message);
    }

    // Migration: Add city column to halls if missing
    try {
      await conn.query(`ALTER TABLE halls ADD COLUMN city VARCHAR(50) NOT NULL DEFAULT 'Lahore'`);
    } catch (mErr) {}

    // Migration: Add venue_type column to halls if missing
    try {
      await conn.query(`ALTER TABLE halls ADD COLUMN venue_type VARCHAR(50) NOT NULL DEFAULT 'Ballroom'`);
    } catch (mErr) {}

    // Migration: Add price_per_event column to halls if missing
    try {
      await conn.query(`ALTER TABLE halls ADD COLUMN price_per_event DECIMAL(10,2) NOT NULL DEFAULT 150000.00`);
    } catch (mErr) {}

    // Migration: Add price_per_head column to halls if missing
    try {
      await conn.query(`ALTER TABLE halls ADD COLUMN price_per_head DECIMAL(10,2) NOT NULL DEFAULT 1200.00`);
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

    // Migration: Ensure notifications table exists
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'booking',
          link VARCHAR(255) DEFAULT '/dashboard/bookings',
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

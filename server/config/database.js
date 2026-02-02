const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables if they don't exist
const initializeDatabase = async () => {
  try {
    // Check if membership_plans table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'membership_plans'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Creating membership_plans table...');

      // Create the table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS membership_plans (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          price DECIMAL(10,2) NOT NULL,
          duration_months INTEGER NOT NULL,
          profile_views_limit INTEGER DEFAULT NULL,
          features TEXT[] DEFAULT '{}',
          color VARCHAR(100) DEFAULT 'from-gray-400 to-gray-600',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Insert default plans (NULL means unlimited)
      await pool.query(`
        INSERT INTO membership_plans (name, price, duration_months, profile_views_limit, features, color, is_active) VALUES
        ('Gold', 2999, 3, 50, ARRAY['View 50 Profiles', 'Send 25 Interests', 'Chat Support'], 'from-yellow-400 to-yellow-600', true),
        ('Silver', 1999, 3, 100, ARRAY['View 100 Profiles', 'Send 50 Interests', 'Email Support'], 'from-gray-300 to-gray-500', true),
        ('Platinum', 4999, 6, NULL, ARRAY['Unlimited Profiles', 'Unlimited Interests', '24/7 Support', 'Verified Badge', 'Featured Profile'], 'from-purple-400 to-purple-600', true)
        ON CONFLICT (name) DO NOTHING;
      `);

      console.log('membership_plans table created successfully');
    } else {
      // Add profile_views_limit column if it doesn't exist
      const columnCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'membership_plans'
          AND column_name = 'profile_views_limit'
        );
      `);

      if (!columnCheck.rows[0].exists) {
        console.log('Adding profile_views_limit column to membership_plans...');
        await pool.query(`
          ALTER TABLE membership_plans ADD COLUMN profile_views_limit INTEGER DEFAULT NULL;
        `);

        // Update existing plans with default limits
        await pool.query(`
          UPDATE membership_plans SET profile_views_limit = 50 WHERE LOWER(name) = 'gold';
          UPDATE membership_plans SET profile_views_limit = 100 WHERE LOWER(name) = 'silver';
          UPDATE membership_plans SET profile_views_limit = NULL WHERE LOWER(name) = 'platinum';
        `);
        console.log('profile_views_limit column added successfully');
      }
    }

    // Check if site_settings table exists
    const settingsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'site_settings'
      );
    `);

    if (!settingsTableCheck.rows[0].exists) {
      console.log('Creating site_settings table...');

      // Create the settings table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Insert default theme settings
      await pool.query(`
        INSERT INTO site_settings (setting_key, setting_value) VALUES
        ('theme', '{"primary": "#1EA826", "primaryDark": "#0B7813", "primaryLight": "#1f7a4d", "gold": "#FFFFFF", "goldLight": "#f5e6b0", "maroon": "#7a1f2b", "ivory": "#fffaf0"}')
        ON CONFLICT (setting_key) DO NOTHING;
      `);

      console.log('site_settings table created successfully');
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

// Run initialization
initializeDatabase();

module.exports = pool;

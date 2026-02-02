const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000,
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err);
  });

// Wrapper to maintain compatibility with pg-style queries
const db = {
  query: async (text, params) => {
    // Use query() for statements without params, execute() for parameterized queries
    if (!params || params.length === 0) {
      const [rows] = await pool.query(text);
      return { rows };
    }
    const [rows] = await pool.execute(text, params);
    return { rows };
  },
  connect: async () => {
    const connection = await pool.getConnection();
    return {
      query: async (text, params) => {
        // Use query() for transaction commands and non-parameterized queries
        if (!params || params.length === 0) {
          const [rows] = await connection.query(text);
          return { rows };
        }
        const [rows] = await connection.execute(text, params);
        return { rows };
      },
      release: () => connection.release()
    };
  }
};

// Initialize database tables if they don't exist
const initializeDatabase = async () => {
  try {
    // Check if membership_plans table exists
    const [tableCheck] = await pool.execute(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'membership_plans'
    `);

    if (tableCheck[0].count === 0) {
      console.log('Creating membership_plans table...');

      // Create the table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS membership_plans (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          price DECIMAL(10,2) NOT NULL,
          duration_months INT NOT NULL,
          profile_views_limit INT DEFAULT NULL,
          features JSON DEFAULT NULL,
          color VARCHAR(100) DEFAULT 'from-gray-400 to-gray-600',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Insert default plans (NULL means unlimited)
      await pool.execute(`
        INSERT IGNORE INTO membership_plans (name, price, duration_months, profile_views_limit, features, color, is_active) VALUES
        ('Gold', 2999, 3, 50, '["View 50 Profiles", "Send 25 Interests", "Chat Support"]', 'from-yellow-400 to-yellow-600', true),
        ('Silver', 1999, 3, 100, '["View 100 Profiles", "Send 50 Interests", "Email Support"]', 'from-gray-300 to-gray-500', true),
        ('Platinum', 4999, 6, NULL, '["Unlimited Profiles", "Unlimited Interests", "24/7 Support", "Verified Badge", "Featured Profile"]', 'from-purple-400 to-purple-600', true)
      `);

      console.log('membership_plans table created successfully');
    } else {
      // Add profile_views_limit column if it doesn't exist
      const [columnCheck] = await pool.execute(`
        SELECT COUNT(*) as count FROM information_schema.columns
        WHERE table_schema = DATABASE()
        AND table_name = 'membership_plans'
        AND column_name = 'profile_views_limit'
      `);

      if (columnCheck[0].count === 0) {
        console.log('Adding profile_views_limit column to membership_plans...');
        await pool.execute(`
          ALTER TABLE membership_plans ADD COLUMN profile_views_limit INT DEFAULT NULL
        `);

        // Update existing plans with default limits
        await pool.execute(`UPDATE membership_plans SET profile_views_limit = 50 WHERE LOWER(name) = 'gold'`);
        await pool.execute(`UPDATE membership_plans SET profile_views_limit = 100 WHERE LOWER(name) = 'silver'`);
        await pool.execute(`UPDATE membership_plans SET profile_views_limit = NULL WHERE LOWER(name) = 'platinum'`);
        console.log('profile_views_limit column added successfully');
      }
    }

    // Check if site_settings table exists
    const [settingsTableCheck] = await pool.execute(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'site_settings'
    `);

    if (settingsTableCheck[0].count === 0) {
      console.log('Creating site_settings table...');

      // Create the settings table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Insert default theme settings
      await pool.execute(`
        INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
        ('theme', '{"primary": "#1EA826", "primaryDark": "#0B7813", "primaryLight": "#1f7a4d", "gold": "#FFFFFF", "goldLight": "#f5e6b0", "maroon": "#7a1f2b", "ivory": "#fffaf0"}')
      `);

      console.log('site_settings table created successfully');
    }

    // Migrate membership_type ENUM to include 'silver'
    const [membershipTypeCheck] = await pool.execute(`
      SELECT COLUMN_TYPE FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'membership_type'
    `);

    if (membershipTypeCheck.length > 0) {
      const columnType = membershipTypeCheck[0].COLUMN_TYPE;
      if (!columnType.includes('silver')) {
        console.log('Adding silver to membership_type ENUM...');
        await pool.execute(`
          ALTER TABLE users MODIFY COLUMN membership_type ENUM('gold', 'silver', 'platinum', 'premium') DEFAULT NULL
        `);
        console.log('membership_type ENUM updated successfully');
      }
    }

    // Migrate interested_membership ENUM to include 'silver'
    const [interestedMembershipCheck] = await pool.execute(`
      SELECT COLUMN_TYPE FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'interested_membership'
    `);

    if (interestedMembershipCheck.length > 0) {
      const columnType = interestedMembershipCheck[0].COLUMN_TYPE;
      if (!columnType.includes('silver')) {
        console.log('Adding silver to interested_membership ENUM...');
        await pool.execute(`
          ALTER TABLE users MODIFY COLUMN interested_membership ENUM('gold', 'silver', 'platinum', 'premium') DEFAULT NULL
        `);
        console.log('interested_membership ENUM updated successfully');
      }
    }

    // Check if sidebar_settings exists in site_settings
    const [sidebarCheck] = await pool.execute(`
      SELECT COUNT(*) as count FROM site_settings
      WHERE setting_key = 'sidebar_settings'
    `);

    if (sidebarCheck[0].count === 0) {
      console.log('Creating default sidebar_settings...');
      const defaultSidebarSettings = {
        items: [
          { key: 'dashboard', label: 'Dashboard', path: '/dashboard', enabled: true },
          { key: 'users', label: 'User List', path: '/users', enabled: true },
          { key: 'bulk-upload', label: 'Bulk Upload', path: '/users/bulk-upload', enabled: true },
          { key: 'set-password', label: 'Set Password', path: '/set-password', enabled: true },
          { key: 'manage-passwords', label: 'Manage Passwords', path: '/manage-passwords', enabled: true },
          { key: 'matches', label: 'Matches', path: '/matches', enabled: true },
          { key: 'assign-match', label: 'Assign Match', path: '/assign-match', enabled: true },
          { key: 'interests', label: 'Interests', path: '/interests', enabled: true },
          { key: 'membership', label: 'Membership Plans', path: '/membership', enabled: true },
          { key: 'settings', label: 'Settings', path: '/settings', enabled: true }
        ]
      };
      await pool.execute(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES ('sidebar_settings', ?)`,
        [JSON.stringify(defaultSidebarSettings)]
      );
      console.log('sidebar_settings created successfully');
    }

    // Check if column_settings exists in site_settings
    const [columnCheck] = await pool.execute(`
      SELECT COUNT(*) as count FROM site_settings
      WHERE setting_key = 'column_settings'
    `);

    if (columnCheck[0].count === 0) {
      console.log('Creating default column_settings...');
      const defaultColumnSettings = {
        userList: [
          { key: 'select', label: 'Select', enabled: true },
          { key: 'user', label: 'User', enabled: true },
          { key: 'contact', label: 'Contact', enabled: true },
          { key: 'age_gender', label: 'Age/Gender', enabled: true },
          { key: 'payment', label: 'Payment', enabled: true },
          { key: 'membership', label: 'Membership', enabled: true },
          { key: 'actions', label: 'Actions', enabled: true }
        ],
        matches: [
          { key: 'select', label: 'Select', enabled: true },
          { key: 'user1', label: 'User 1', enabled: true },
          { key: 'user2', label: 'User 2', enabled: true },
          { key: 'matched_by', label: 'Matched By', enabled: true },
          { key: 'matched_at', label: 'Matched At', enabled: true },
          { key: 'actions', label: 'Actions', enabled: true }
        ],
        interests: [
          { key: 'from_user', label: 'From User', enabled: true },
          { key: 'to_user', label: 'To User', enabled: true },
          { key: 'status', label: 'Status', enabled: true },
          { key: 'sent_at', label: 'Sent At', enabled: true },
          { key: 'actions', label: 'Actions', enabled: true }
        ],
        membership: [
          { key: 'name', label: 'Plan Name', enabled: true },
          { key: 'price', label: 'Price', enabled: true },
          { key: 'duration', label: 'Duration', enabled: true },
          { key: 'features', label: 'Features', enabled: true },
          { key: 'status', label: 'Status', enabled: true },
          { key: 'actions', label: 'Actions', enabled: true }
        ]
      };
      await pool.execute(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES ('column_settings', ?)`,
        [JSON.stringify(defaultColumnSettings)]
      );
      console.log('column_settings created successfully');
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

// Run initialization
initializeDatabase();

module.exports = db;

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

    // Migrate membership_type from ENUM to VARCHAR for dynamic plan names
    const [membershipTypeCheck] = await pool.execute(`
      SELECT DATA_TYPE, COLUMN_TYPE FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'membership_type'
    `);

    if (membershipTypeCheck.length > 0) {
      const dataType = membershipTypeCheck[0].DATA_TYPE;
      if (dataType === 'enum') {
        console.log('Migrating membership_type from ENUM to VARCHAR...');
        await pool.execute(`
          ALTER TABLE users MODIFY COLUMN membership_type VARCHAR(50) DEFAULT NULL
        `);
        console.log('membership_type migrated to VARCHAR successfully');
      }
    }

    // Migrate interested_membership from ENUM to VARCHAR for dynamic plan names
    const [interestedMembershipCheck] = await pool.execute(`
      SELECT DATA_TYPE, COLUMN_TYPE FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'interested_membership'
    `);

    if (interestedMembershipCheck.length > 0) {
      const dataType = interestedMembershipCheck[0].DATA_TYPE;
      if (dataType === 'enum') {
        console.log('Migrating interested_membership from ENUM to VARCHAR...');
        await pool.execute(`
          ALTER TABLE users MODIFY COLUMN interested_membership VARCHAR(50) DEFAULT NULL
        `);
        console.log('interested_membership migrated to VARCHAR successfully');
      }
    }

    // Migrate height column from INT to VARCHAR to support feet format (e.g. "5.6")
    const [heightColCheck] = await pool.execute(`
      SELECT DATA_TYPE FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = 'profiles'
      AND column_name = 'height'
    `);

    if (heightColCheck.length > 0 && heightColCheck[0].DATA_TYPE === 'int') {
      console.log('Migrating height column from INT to VARCHAR...');
      await pool.execute(`ALTER TABLE profiles MODIFY COLUMN height VARCHAR(20)`);
      console.log('height column migrated successfully');
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
    // Drop email column from users (email removed from user model)
    const [emailColCheck] = await pool.execute(`
      SELECT COLUMN_NAME FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'email'
    `);
    if (emailColCheck.length > 0) {
      console.log('Dropping email column from users table...');
      await pool.execute('ALTER TABLE users DROP COLUMN email');
      console.log('email column dropped');
    }

    // Make age and gender nullable (Home quick register doesn't collect these)
    const [ageColCheck] = await pool.execute(`
      SELECT IS_NULLABLE FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'age'
    `);
    if (ageColCheck.length > 0 && ageColCheck[0].IS_NULLABLE === 'NO') {
      console.log('Making age column nullable...');
      await pool.execute('ALTER TABLE users MODIFY COLUMN age INT DEFAULT NULL');
      console.log('age column now nullable');
    }

    const [genderColCheck] = await pool.execute(`
      SELECT IS_NULLABLE FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'gender'
    `);
    if (genderColCheck.length > 0 && genderColCheck[0].IS_NULLABLE === 'NO') {
      console.log('Making gender column nullable...');
      await pool.execute("ALTER TABLE users MODIFY COLUMN gender ENUM('male','female','other') DEFAULT NULL");
      console.log('gender column now nullable');
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

// Run initialization
initializeDatabase();

module.exports = db;

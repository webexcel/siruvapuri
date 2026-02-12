const mysql = require('mysql2/promise');

async function migrateInterestedMembership() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: 'main',
    password: 'P@mani4u',
    database: 'matrimonial_db'
  });

  try {
    console.log('Starting interested_membership column migration...\n');

    // Check if column exists
    const [rows] = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'matrimonial_db'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'interested_membership'
    `);

    if (rows.length === 0) {
      // Column doesn't exist, add it
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN interested_membership ENUM('gold', 'platinum', 'premium') DEFAULT NULL
        AFTER membership_expiry
      `);
      console.log('  ✓ Added column: interested_membership');
    } else {
      console.log('  - Column already exists: interested_membership');
    }

    console.log('\n=== Migration completed! ===');

  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await pool.end();
  }
}

migrateInterestedMembership();

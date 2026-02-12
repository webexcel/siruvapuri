const db = require('../config/database');

// Migration script to add plain_password column to users table
async function addPlainPasswordColumn() {
  try {
    console.log('Starting migration: Adding plain_password column...');

    // Check if column already exists (MySQL syntax)
    const checkColumn = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name = 'users' AND column_name = 'plain_password';
    `);

    if (checkColumn.rows.length > 0) {
      console.log('Column plain_password already exists. Skipping migration.');
      process.exit(0);
    }

    // Add the column
    await db.query(`
      ALTER TABLE users
      ADD COLUMN plain_password VARCHAR(255);
    `);

    console.log('Successfully added plain_password column to users table.');
    console.log('');
    console.log('IMPORTANT: Existing users will have NULL plain_password.');
    console.log('When you set/reset passwords for existing users, the plain_password will be populated.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addPlainPasswordColumn();

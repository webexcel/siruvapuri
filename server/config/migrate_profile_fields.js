const mysql = require('mysql2/promise');

async function migrateProfileFields() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: 'main',
    password: 'P@mani4u',
    database: 'matrimonial_db'
  });

  const newColumns = [
    // Primary Information
    "ADD COLUMN IF NOT EXISTS date_of_birth DATE AFTER full_name",
    "ADD COLUMN IF NOT EXISTS birth_place VARCHAR(100) AFTER date_of_birth",
    "ADD COLUMN IF NOT EXISTS complexion ENUM('very_fair', 'fair', 'wheatish', 'brown', 'dark') DEFAULT 'wheatish' AFTER weight",
    "ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10) AFTER complexion",
    "ADD COLUMN IF NOT EXISTS physical_status ENUM('normal', 'physically_challenged') DEFAULT 'normal' AFTER blood_group",

    // Background
    "ADD COLUMN IF NOT EXISTS sub_caste VARCHAR(100) AFTER caste",

    // Education & Career
    "ADD COLUMN IF NOT EXISTS education_detail TEXT AFTER education",
    "ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) AFTER occupation",
    "ADD COLUMN IF NOT EXISTS working_place VARCHAR(100) AFTER company_name",
    "ADD COLUMN IF NOT EXISTS monthly_income VARCHAR(100) AFTER annual_income",

    // Horoscope Details
    "ADD COLUMN IF NOT EXISTS time_of_birth VARCHAR(20) AFTER monthly_income",
    "ADD COLUMN IF NOT EXISTS rasi VARCHAR(50) AFTER time_of_birth",
    "ADD COLUMN IF NOT EXISTS nakshatra VARCHAR(50) AFTER rasi",
    "ADD COLUMN IF NOT EXISTS lagnam VARCHAR(50) AFTER nakshatra",
    "ADD COLUMN IF NOT EXISTS kothram VARCHAR(100) AFTER lagnam",
    "ADD COLUMN IF NOT EXISTS dosham VARCHAR(100) AFTER kothram",
    "ADD COLUMN IF NOT EXISTS matching_stars TEXT AFTER dosham",

    // Family Information
    "ADD COLUMN IF NOT EXISTS father_name VARCHAR(255) AFTER matching_stars",
    "ADD COLUMN IF NOT EXISTS father_occupation VARCHAR(255) AFTER father_name",
    "ADD COLUMN IF NOT EXISTS father_status ENUM('alive', 'deceased') DEFAULT 'alive' AFTER father_occupation",
    "ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255) AFTER father_status",
    "ADD COLUMN IF NOT EXISTS mother_occupation VARCHAR(255) AFTER mother_name",
    "ADD COLUMN IF NOT EXISTS mother_status ENUM('alive', 'deceased') DEFAULT 'alive' AFTER mother_occupation",
    "ADD COLUMN IF NOT EXISTS brothers_count INT DEFAULT 0 AFTER mother_status",
    "ADD COLUMN IF NOT EXISTS brothers_married INT DEFAULT 0 AFTER brothers_count",
    "ADD COLUMN IF NOT EXISTS sisters_count INT DEFAULT 0 AFTER brothers_married",
    "ADD COLUMN IF NOT EXISTS sisters_married INT DEFAULT 0 AFTER sisters_count",
    "ADD COLUMN IF NOT EXISTS family_type ENUM('joint', 'nuclear') DEFAULT 'nuclear' AFTER sisters_married",
    "ADD COLUMN IF NOT EXISTS family_status ENUM('middle_class', 'upper_middle_class', 'rich', 'affluent') DEFAULT 'middle_class' AFTER family_type",
    "ADD COLUMN IF NOT EXISTS own_house ENUM('yes', 'no', 'rented') DEFAULT 'yes' AFTER family_status",
    "ADD COLUMN IF NOT EXISTS native_place VARCHAR(100) AFTER own_house",

    // Address
    "ADD COLUMN IF NOT EXISTS address TEXT AFTER native_place",
    "ADD COLUMN IF NOT EXISTS pincode VARCHAR(10) AFTER country",

    // Alliance Expectations
    "ADD COLUMN IF NOT EXISTS expected_age_min INT AFTER pincode",
    "ADD COLUMN IF NOT EXISTS expected_age_max INT AFTER expected_age_min",
    "ADD COLUMN IF NOT EXISTS expected_qualification VARCHAR(255) AFTER expected_age_max",
    "ADD COLUMN IF NOT EXISTS expected_location VARCHAR(255) AFTER expected_qualification",
    "ADD COLUMN IF NOT EXISTS expected_income VARCHAR(100) AFTER expected_location"
  ];

  try {
    console.log('Starting profile fields migration...\n');

    for (const columnDef of newColumns) {
      try {
        // MySQL doesn't support IF NOT EXISTS for ADD COLUMN, so we need to check first
        const columnName = columnDef.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1];

        if (columnName) {
          // Check if column exists
          const [rows] = await pool.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'matrimonial_db'
            AND TABLE_NAME = 'profiles'
            AND COLUMN_NAME = ?
          `, [columnName]);

          if (rows.length === 0) {
            // Column doesn't exist, add it
            const alterQuery = `ALTER TABLE profiles ${columnDef.replace('IF NOT EXISTS ', '')}`;
            await pool.query(alterQuery);
            console.log(`  ✓ Added column: ${columnName}`);
          } else {
            console.log(`  - Column already exists: ${columnName}`);
          }
        }
      } catch (err) {
        console.error(`  ✗ Error with column: ${err.message}`);
      }
    }

    console.log('\n=== Migration completed! ===');

  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await pool.end();
  }
}

migrateProfileFields();

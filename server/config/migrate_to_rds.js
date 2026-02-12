const mysql = require('mysql2/promise');
const readline = require('readline');

/**
 * Migration Script: Local MySQL -> AWS RDS
 *
 * This script will:
 * 1. Export all data from local database
 * 2. Create tables in RDS (if not exist)
 * 3. Import all data to RDS
 */

// Local database configuration
const localConfig = {
  host: process.env.LOCAL_DB_HOST || 'localhost',
  user: process.env.LOCAL_DB_USER || 'main',
  password: process.env.LOCAL_DB_PASSWORD || 'P@mani4u',
  database: process.env.LOCAL_DB_NAME || 'matrimonial_db'
};

// RDS database configuration
const rdsConfig = {
  host: 'schooltree-prod.cfcyioeqyfml.ap-south-1.rds.amazonaws.com',
  user: 'main',
  password: 'P@mani4u',
  database: 'matrimonial_db',
  port: 3306
};

// Tables in order of dependency (for foreign key constraints)
const tables = [
  'admins',
  'membership_plans',
  'site_settings',
  'users',
  'profiles',
  'preferences',
  'matches',
  'interests',
  'profile_views'
];

async function promptCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

  if (!rdsConfig.user) {
    rdsConfig.user = await question('RDS Username: ');
  }
  if (!rdsConfig.password) {
    rdsConfig.password = await question('RDS Password: ');
  }
  if (!rdsConfig.database) {
    rdsConfig.database = await question('RDS Database Name (default: matrimonial_db): ') || 'matrimonial_db';
  }

  rl.close();
}

async function testConnection(config, name) {
  try {
    const conn = await mysql.createConnection(config);
    console.log(`✓ Connected to ${name} successfully`);
    await conn.end();
    return true;
  } catch (error) {
    console.error(`✗ Failed to connect to ${name}: ${error.message}`);
    return false;
  }
}

async function getTableData(conn, tableName) {
  try {
    const [rows] = await conn.query(`SELECT * FROM ${tableName}`);
    return rows;
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log(`  - Table ${tableName} does not exist in source`);
      return [];
    }
    throw error;
  }
}

async function createTablesInRDS(rdsConn) {
  console.log('\n📋 Creating tables in RDS...\n');

  // Read and execute schema
  const fs = require('fs');
  const path = require('path');
  const schemaPath = path.join(__dirname, 'schema.sql');

  if (!fs.existsSync(schemaPath)) {
    console.error('Schema file not found at:', schemaPath);
    return false;
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Split by semicolon and execute each statement
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      // Skip comments and empty statements
      if (statement.startsWith('--') || !statement.trim()) continue;

      await rdsConn.query(statement);
    } catch (error) {
      // Ignore "table already exists" errors
      if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
        console.log(`  Warning: ${error.message.substring(0, 100)}`);
      }
    }
  }

  console.log('✓ Tables created/verified in RDS\n');
  return true;
}

async function migrateTable(localConn, rdsConn, tableName) {
  console.log(`\n📦 Migrating table: ${tableName}`);

  try {
    // Get data from local
    const data = await getTableData(localConn, tableName);

    if (data.length === 0) {
      console.log(`  - No data to migrate for ${tableName}`);
      return { table: tableName, count: 0, status: 'empty' };
    }

    console.log(`  - Found ${data.length} rows`);

    // Clear existing data in RDS (optional - be careful!)
    // await rdsConn.query(`DELETE FROM ${tableName}`);

    // Get column names from first row
    const columns = Object.keys(data[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const columnList = columns.map(c => `\`${c}\``).join(', ');

    // Insert data in batches
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      for (const row of batch) {
        const values = columns.map(col => row[col]);
        try {
          await rdsConn.query(
            `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders})
             ON DUPLICATE KEY UPDATE ${columns.map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(', ')}`,
            values
          );
          inserted++;
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            // Skip duplicate entries
            console.log(`  - Skipped duplicate: ${error.message.substring(0, 50)}`);
          } else {
            console.error(`  ✗ Error inserting row: ${error.message}`);
          }
        }
      }
    }

    console.log(`  ✓ Migrated ${inserted}/${data.length} rows`);
    return { table: tableName, count: inserted, status: 'success' };

  } catch (error) {
    console.error(`  ✗ Error migrating ${tableName}: ${error.message}`);
    return { table: tableName, count: 0, status: 'error', error: error.message };
  }
}

async function migrate() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  MySQL Migration: Local → AWS RDS');
  console.log('═══════════════════════════════════════════════════════\n');

  // Prompt for RDS credentials if not set
  await promptCredentials();

  console.log('\n🔗 Testing connections...\n');

  // Test local connection
  const localOk = await testConnection(localConfig, 'Local MySQL');
  if (!localOk) {
    console.error('\nCannot proceed without local database connection.');
    process.exit(1);
  }

  // Test RDS connection
  const rdsOk = await testConnection(rdsConfig, 'AWS RDS');
  if (!rdsOk) {
    console.error('\nCannot proceed without RDS connection.');
    console.error('Make sure:');
    console.error('  1. RDS instance is running');
    console.error('  2. Security group allows your IP');
    console.error('  3. Credentials are correct');
    process.exit(1);
  }

  // Create connections
  const localConn = await mysql.createConnection(localConfig);
  const rdsConn = await mysql.createConnection(rdsConfig);

  try {
    // Disable foreign key checks for migration
    await rdsConn.query('SET FOREIGN_KEY_CHECKS = 0');

    // Create tables in RDS
    await createTablesInRDS(rdsConn);

    // Migrate each table
    const results = [];
    for (const table of tables) {
      const result = await migrateTable(localConn, rdsConn, table);
      results.push(result);
    }

    // Re-enable foreign key checks
    await rdsConn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Print summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Migration Summary');
    console.log('═══════════════════════════════════════════════════════\n');

    let totalRows = 0;
    for (const result of results) {
      const status = result.status === 'success' ? '✓' :
                     result.status === 'empty' ? '○' : '✗';
      console.log(`  ${status} ${result.table}: ${result.count} rows`);
      totalRows += result.count;
    }

    console.log(`\n  Total rows migrated: ${totalRows}`);
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Migration completed!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📝 Next steps:');
    console.log('  1. Update your .env file with RDS credentials:');
    console.log(`     DB_HOST=${rdsConfig.host}`);
    console.log(`     DB_USER=${rdsConfig.user}`);
    console.log(`     DB_PASSWORD=<your-password>`);
    console.log(`     DB_NAME=${rdsConfig.database}`);
    console.log('  2. Restart your server');
    console.log('  3. Test the application\n');

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
  } finally {
    await localConn.end();
    await rdsConn.end();
  }
}

// Run migration
migrate().catch(console.error);

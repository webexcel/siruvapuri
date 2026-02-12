const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const backupDir = path.join(__dirname, '../backups');
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

// Create backups directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Database credentials from environment
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '3306';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME || 'matrimonial_db';

// Create backup using mysqldump
const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} > "${backupFile}"`;

console.log('Starting database backup...');
console.log(`Backup file: ${backupFile}`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }

  if (stderr && !stderr.includes('Warning')) {
    console.error('Backup warnings:', stderr);
  }

  console.log('Backup completed successfully!');
  console.log(`File saved to: ${backupFile}`);

  // Get file size
  const stats = fs.statSync(backupFile);
  const fileSizeInBytes = stats.size;
  const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
  console.log(`Backup size: ${fileSizeInMB} MB`);

  // Clean up old backups (keep last 7 days)
  cleanupOldBackups();
});

function cleanupOldBackups() {
  const retentionDays = 7;
  const maxAge = retentionDays * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const now = Date.now();

  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error('Error reading backup directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }

        const fileAge = now - stats.mtimeMs;
        if (fileAge > maxAge) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error(`Error deleting old backup ${file}:`, err);
            } else {
              console.log(`Deleted old backup: ${file}`);
            }
          });
        }
      });
    });
  });
}

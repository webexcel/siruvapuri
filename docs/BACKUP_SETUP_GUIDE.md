# Database Backup Setup Guide

This guide explains how to set up automated database backups for the Siruvapuri Matrimony platform.

## Manual Backup

To create a manual backup, run:

```bash
cd server
node scripts/backupDatabase.js
```

This will create a backup file in `server/backups/` with a timestamp.

## Automated Backup Setup (Windows)

### Using Windows Task Scheduler

1. **Open Task Scheduler**
   - Press `Win + R`
   - Type `taskschd.msc` and press Enter

2. **Create a New Task**
   - Click "Create Basic Task" in the right panel
   - Name: "Matrimony Database Backup"
   - Description: "Daily backup of matrimonial database"

3. **Set Trigger**
   - Select "Daily"
   - Set time (recommended: 2:00 AM when traffic is low)
   - Click Next

4. **Set Action**
   - Select "Start a program"
   - Program/script: `C:\projects\siruvapuri_new\server\scripts\backup.bat`
   - Start in: `C:\projects\siruvapuri_new\server`
   - Click Next and Finish

5. **Configure Advanced Settings** (Optional)
   - Right-click the created task → Properties
   - Under "General" tab:
     - Check "Run whether user is logged on or not"
     - Check "Run with highest privileges"
   - Under "Settings" tab:
     - Check "If the task fails, restart every: 1 minute"
     - Set "Attempt to restart up to: 3 times"

## Automated Backup Setup (Linux/Mac)

### Using Cron

1. **Edit crontab**
   ```bash
   crontab -e
   ```

2. **Add daily backup job** (runs at 2 AM daily)
   ```bash
   0 2 * * * cd /path/to/siruvapuri_new/server && node scripts/backupDatabase.js >> /path/to/siruvapuri_new/server/logs/backup.log 2>&1
   ```

3. **Create logs directory**
   ```bash
   mkdir -p server/logs
   ```

## Backup Features

### Automatic Cleanup
- Backups older than 7 days are automatically deleted
- Keeps your backup directory from growing too large
- Configurable retention period in `backupDatabase.js`

### File Naming
Backups are named with timestamps:
```
backup-2025-12-30T02-00-00.sql
```

## Backup Location

All backups are stored in:
```
server/backups/
```

⚠️ **Important:** Add `server/backups/` to `.gitignore` to avoid committing backup files.

## Restoring from Backup

### Restore Command

```bash
psql -U postgres -d matrimonial_db < server/backups/backup-YYYY-MM-DDTHH-MM-SS.sql
```

### Step-by-Step Restore

1. **Stop the application**
   ```bash
   # Stop the Node.js server
   ```

2. **Drop and recreate database**
   ```bash
   psql -U postgres -c "DROP DATABASE matrimonial_db;"
   psql -U postgres -c "CREATE DATABASE matrimonial_db;"
   ```

3. **Restore from backup**
   ```bash
   psql -U postgres -d matrimonial_db -f "server/backups/backup-2025-12-30T02-00-00.sql"
   ```

4. **Restart the application**

## Monitoring Backups

### Check Backup Status

List all backups:
```bash
ls -lh server/backups/
```

Check latest backup:
```bash
ls -lt server/backups/ | head -n 2
```

### Backup Size

The backup script automatically displays the backup size after completion.

Typical backup sizes:
- Empty database: ~5 KB
- 100 users: ~50 KB
- 1000 users: ~500 KB
- 10000 users: ~5 MB

## Cloud Backup (Recommended for Production)

For production environments, consider uploading backups to cloud storage:

### AWS S3 Example

```javascript
// Add to backupDatabase.js after successful backup
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const uploadParams = {
  Bucket: 'your-backup-bucket',
  Key: path.basename(backupFile),
  Body: fs.createReadStream(backupFile)
};

s3.upload(uploadParams, (err, data) => {
  if (err) {
    console.error('S3 upload failed:', err);
  } else {
    console.log('Backup uploaded to S3:', data.Location);
  }
});
```

### Google Drive Example

Use `googleapis` package to upload to Google Drive.

## Troubleshooting

### pg_dump command not found

**Solution:** Add PostgreSQL bin directory to PATH
- Windows: `C:\Program Files\PostgreSQL\XX\bin`
- Linux/Mac: Usually already in PATH

### Permission denied

**Solution:** Ensure the scripts have execute permissions
```bash
chmod +x server/scripts/backup.bat
```

### Disk space issues

**Solution:**
- Reduce retention days in `backupDatabase.js`
- Compress backups: `gzip backup-*.sql`
- Move old backups to external storage

## Best Practices

1. **Test Restores Regularly**
   - Restore backups to a test environment monthly
   - Verify data integrity after restore

2. **Monitor Backup Success**
   - Check backup logs daily
   - Set up alerts for failed backups

3. **Multiple Backup Locations**
   - Keep local backups for quick recovery
   - Store cloud backups for disaster recovery
   - Consider offsite backups

4. **Document Restore Procedures**
   - Keep this guide updated
   - Train team members on restore process

5. **Backup Before Major Changes**
   - Always backup before schema migrations
   - Backup before major updates
   - Keep pre-change backups for at least 30 days

## Configuration

### Change Retention Period

Edit `server/scripts/backupDatabase.js`:
```javascript
const retentionDays = 30; // Change from 7 to 30 days
```

### Change Backup Directory

Edit `server/scripts/backupDatabase.js`:
```javascript
const backupDir = path.join(__dirname, '../backups'); // Change path
```

## Security

- Backup files contain sensitive data
- Encrypt backups if storing in cloud
- Limit access to backup directory
- Use strong passwords for database
- Regularly update PostgreSQL

---

**Questions or Issues?**

Check the logs or contact the development team.


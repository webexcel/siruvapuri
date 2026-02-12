module.exports = {
  apps: [
    {
      name: 'siruvapuri-api',
      cwd: '/var/www/siruvapuri/server',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/siruvapuri-error.log',
      out_file: '/var/log/pm2/siruvapuri-out.log',
      log_file: '/var/log/pm2/siruvapuri-combined.log',
      time: true
    }
  ]
};

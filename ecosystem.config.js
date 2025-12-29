module.exports = {
  apps: [{
    name: 'wppconnect-server',
    script: './dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    },
    // Graceful shutdown settings
    kill_timeout: 10000, // Wait 10s before force kill
    listen_timeout: 5000,
    shutdown_with_message: false,
    // Logs
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    merge_logs: true,
    // Restart settings
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
  }]
};

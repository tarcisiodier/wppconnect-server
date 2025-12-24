module.exports = {
  apps: [
    {
      name: 'wppconnect-server',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      // Passa todas as variáveis de ambiente do processo para o PM2
      // Isso permite usar variáveis definidas no .env ou sistema
      env: {
        // Ambiente da aplicação
        NODE_ENV: process.env.NODE_ENV || 'production',
        // Configurações básicas
        PORT: process.env.PORT || '21465',
        SECRET_KEY: process.env.SECRET_KEY,
        HOST: process.env.HOST,
        DEVICE_NAME: process.env.DEVICE_NAME,
        POWERED_BY: process.env.POWERED_BY,
        // Configurações de sessão
        START_ALL_SESSION: process.env.START_ALL_SESSION,
        TOKEN_STORE_TYPE: process.env.TOKEN_STORE_TYPE,
        MAX_LISTENERS: process.env.MAX_LISTENERS,
        CUSTOM_USER_DATA_DIR: process.env.CUSTOM_USER_DATA_DIR,
        // Configurações de log
        LOG_LEVEL: process.env.LOG_LEVEL,
        LOG_LOGGER: process.env.LOG_LOGGER,
        // Passa todas as outras variáveis de ambiente
        ...process.env,
      },
      // Logs: No Docker, pm2-runtime redireciona automaticamente para stdout/stderr
      // Para produção sem Docker, os logs serão salvos nos arquivos abaixo
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};


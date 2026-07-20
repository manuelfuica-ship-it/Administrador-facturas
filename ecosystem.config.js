module.exports = {
  apps: [
    {
      name: 'dte-app',
      script: 'npm',
      args: 'run dev -- -p 3001',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      // Reiniciar automáticamente si la app crashea
      autorestart: true,
      // Si falla, esperar 5 segundos antes de reintentar
      max_restarts: 10,
      min_uptime: '10s',
      // Logs
      output: 'logs/out.log',
      error: 'logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Ignorar estos directorios
      ignore_watch: ['node_modules', 'logs', '.next'],
      // Monitorar cambios en código y reiniciar
      watch: ['src', 'public'],
      watch_delay: 1000,
    }
  ]
};

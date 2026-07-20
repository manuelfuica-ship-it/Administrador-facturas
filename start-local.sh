#!/bin/bash

# DTE Chile App - Script de inicio con PM2

echo "🚀 Iniciando DTE Chile App..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

# Crear carpeta de logs si no existe
mkdir -p logs

# Iniciar app con PM2
npx pm2 start ecosystem.config.js

echo ""
echo "✅ App iniciada con PM2"
echo ""
echo "📱 Acceder en: http://localhost:3001"
echo ""
echo "🔧 Comandos útiles:"
echo "   npx pm2 status              - Ver estado"
echo "   npx pm2 logs dte-app        - Ver logs"
echo "   npx pm2 restart dte-app     - Reiniciar"
echo "   npx pm2 stop dte-app        - Detener"
echo "   npx pm2 delete dte-app      - Eliminar del inicio"
echo ""

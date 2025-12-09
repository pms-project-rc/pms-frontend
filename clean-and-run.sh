#!/bin/bash
# Script para limpiar y recompilar el frontend

echo "🔧 Limpiando Frontend..."

# En Windows PowerShell, usa esto en lugar de los comandos de bash arriba
# Si estás en bash/WSL, descomenta los comandos de abajo

# rm -rf node_modules/.vite
# rm -rf dist/

echo "📦 Limpiando cache de npm..."
npm cache clean --force

echo "⬇️ Instalando dependencias..."
npm install

echo "🚀 Iniciando servidor de desarrollo..."
npm run dev

echo ""
echo "El servidor de desarrollo debería estar corriendo en http://localhost:5173"
echo "Abre DevTools (F12) y ve a la pestaña Console para ver los logs."

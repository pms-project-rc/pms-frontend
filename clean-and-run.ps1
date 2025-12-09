# Script para limpiar y recompilar el frontend en Windows PowerShell

Write-Host "🔧 Limpiando Frontend..." -ForegroundColor Cyan

# Limpiar carpetas de build y cache
Write-Host "📁 Removiendo carpetas de cache..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "📦 Limpiando cache de npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "⬇️ Instalando dependencias..." -ForegroundColor Yellow
npm install

Write-Host "✅ Instalación completa. Iniciando servidor..." -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ejecutando npm run dev..." -ForegroundColor Cyan
npm run dev

Write-Host ""
Write-Host "ℹ️ El servidor de desarrollo debería estar corriendo en http://localhost:5173" -ForegroundColor Green
Write-Host "💡 Abre DevTools (F12) y ve a la pestaña Console para ver los logs." -ForegroundColor Green

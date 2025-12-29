#!/bin/bash

# QUICK FIX - Execute isso no servidor de produção

echo "🛑 KILLING ALL WPP CONTAINERS..."

# Parar todos os containers wpp
docker stop $(docker ps -q -f name=wpp) 2>/dev/null || true

# Matar com força
docker kill $(docker ps -q -f name=wpp) 2>/dev/null || true

# Remover
docker rm $(docker ps -aq -f name=wpp) 2>/dev/null || true

echo "🔓 CLEANING LOCK FILES..."

# Limpar todos os locks
find ./wppconnect_userdata -name "SingletonLock" -delete 2>/dev/null || true
find ./wppconnect_userdata -name "SingletonSocket" -delete 2>/dev/null || true
find ./wppconnect_userdata -name "SingletonCookie" -delete 2>/dev/null || true

# Verificar se ainda tem processos
REMAINING=$(docker ps -q -f name=wpp | wc -l)
if [ $REMAINING -gt 0 ]; then
  echo "❌ AINDA HÁ CONTAINERS RODANDO!"
  docker ps -f name=wpp
  exit 1
fi

echo "✅ TUDO LIMPO!"
echo ""
echo "🚀 Agora rode: docker-compose up -d"

# 🔧 Fix: Chromium Profile Lock Error

## Erro:
```
The profile appears to be in use by another Chromium process
```

## ⚡ Solução Rápida (no servidor de produção):

### Opção 1: Usar o script de deploy
```bash
./deploy-remote.sh
```

### Opção 2: Comandos manuais
```bash
# 1. Parar containers
docker-compose down

# 2. Limpar locks
find ./wppconnect_userdata -name "SingletonLock" -delete
find ./wppconnect_userdata -name "SingletonSocket" -delete
find ./wppconnect_userdata -name "SingletonCookie" -delete

# 3. Subir novamente
docker-compose up -d
```

### Opção 3: Restart rápido (se já funcionou antes)
```bash
docker-compose restart
```

## 🔍 Diagnóstico

Verificar se há containers rodando:
```bash
docker-compose ps
docker ps | grep wpp
```

Ver logs do erro:
```bash
docker-compose logs --tail=50
```

## 🚨 Se AINDA estiver com erro

Isso significa que o entrypoint não está limpando os locks. Tente:

```bash
# Parar tudo
docker-compose down

# Matar processos Chromium (se existirem)
docker-compose exec wppconnect pkill -9 chromium || true

# Limpar TODOS os dados de sessão (⚠️ CUIDADO: perde sessões!)
rm -rf ./wppconnect_userdata/*

# Subir de novo
docker-compose up -d
```

## 📝 Prevenção

**SEMPRE use um destes métodos para deploy:**

✅ `./deploy-remote.sh` (recomendado)
✅ `docker-compose down && docker-compose up -d`
❌ **NUNCA** `docker-compose up -d` sem parar antes!

## 🐛 Debug

Se o entrypoint não está funcionando:

```bash
# Ver se o script existe no container
docker-compose exec wppconnect ls -la /usr/local/bin/docker-entrypoint.sh

# Ver se está sendo executado
docker-compose logs | grep "Checking for Chromium lock"
```

Se não aparecer "Checking for Chromium lock", o entrypoint não está sendo executado.

## 🔄 Rebuild completo

Se nada funcionar, rebuild total:

```bash
docker-compose down -v  # ⚠️ Remove volumes!
docker-compose build --no-cache
docker-compose up -d
```

**Atenção:** Isso remove TODAS as sessões salvas!

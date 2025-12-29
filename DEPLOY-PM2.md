# 🚀 Deploy com PM2 - Sem Problemas de Lock!

## Por que PM2?

✅ **Graceful shutdown** - Para o Chromium corretamente
✅ **Zero downtime** - Reinicia sem locks
✅ **Auto-restart** - Se crashar, reinicia automaticamente
✅ **Logs centralizados** - Fácil debug
✅ **Process management** - Controle total do processo

## Deploy Rápido

```bash
# No servidor de produção
./deploy-remote.sh
```

## O que mudou?

### Antes (Node direto)
```
Docker → Node → Chromium
```
Problema: Quando para o container, Chromium às vezes não fecha, deixando locks.

### Agora (com PM2)
```
Docker → PM2 → Node → Chromium
```
Solução: PM2 gerencia o shutdown gracefully, matando Chromium corretamente.

## Comandos Úteis

### No servidor (dentro do container)

```bash
# Ver status do PM2
docker-compose exec wppconnect pm2 status

# Ver logs em tempo real
docker-compose exec wppconnect pm2 logs

# Reiniciar aplicação (sem rebuild)
docker-compose exec wppconnect pm2 restart wppconnect-server

# Ver informações detalhadas
docker-compose exec wppconnect pm2 show wppconnect-server

# Monitorar recursos
docker-compose exec wppconnect pm2 monit
```

### Fora do container

```bash
# Ver logs do container
docker-compose logs -f

# Reiniciar container (PM2 faz graceful shutdown)
docker-compose restart

# Deploy novo código
./deploy-remote.sh
```

## Vantagens do PM2

### 1. Restart sem downtime
```bash
# Reinicia a aplicação sem parar o container
docker-compose exec wppconnect pm2 restart wppconnect-server
```

### 2. Logs organizados
```bash
# Logs separados por tipo
/usr/src/wpp-server/logs/pm2-error.log    # Apenas erros
/usr/src/wpp-server/logs/pm2-out.log      # Stdout
/usr/src/wpp-server/logs/pm2-combined.log # Tudo junto
```

### 3. Auto-restart em crash
Se o Node crashar, PM2 reinicia automaticamente (até 10 vezes).

### 4. Memory limit
PM2 reinicia se passar de 1GB de RAM (configurável).

### 5. Graceful shutdown
Quando para o container:
1. PM2 recebe SIGTERM
2. Para o Node.js gracefully
3. Node fecha o Chromium
4. Remove lock files
5. Container para

## Configuração (ecosystem.config.js)

```javascript
{
  name: 'wppconnect-server',
  script: './dist/server.js',
  instances: 1,                // 1 instância
  max_memory_restart: '1G',    // Restart se > 1GB
  kill_timeout: 10000,         // 10s para shutdown graceful
  max_restarts: 10,            // Máximo de restarts
}
```

## Troubleshooting

### PM2 não está rodando
```bash
docker-compose exec wppconnect pm2 status
```

Se não aparecer nada, o PM2 não iniciou. Veja os logs:
```bash
docker-compose logs wppconnect
```

### Restart manual
```bash
# Parar tudo
docker-compose exec wppconnect pm2 stop all
docker-compose exec wppconnect pm2 kill

# Limpar locks
docker-compose exec wppconnect find /usr/src/wpp-server/userDataDir -name "SingletonLock" -delete

# Iniciar de novo
docker-compose exec wppconnect pm2 start ecosystem.config.js
```

### Ver processo Chromium
```bash
docker-compose exec wppconnect ps aux | grep chromium
```

### Matar Chromium manualmente (emergência)
```bash
docker-compose exec wppconnect pkill -9 chromium
```

## Comparação: Antes vs Depois

| Aspecto | Antes (Node) | Agora (PM2) |
|---------|--------------|-------------|
| Lock issues | ⚠️ Frequente | ✅ Raro |
| Graceful shutdown | ❌ Não | ✅ Sim |
| Auto-restart | ❌ Não | ✅ Sim |
| Logs | 😕 Misturados | ✅ Organizados |
| Memory limit | ❌ Não | ✅ 1GB |
| Hot reload | ❌ Não | ✅ Sim |

## Deploy Workflow

```bash
# 1. Fazer mudanças no código local
git add .
git commit -m "fix: ..."
git push

# 2. No servidor, puxar código
cd /path/to/wppconnect-server
git pull

# 3. Deploy
./deploy-remote.sh

# Ou manual:
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 4. Verificar
docker-compose logs -f
```

## Monitoramento

### CPU e Memória
```bash
docker stats wpp-server
```

### Logs em tempo real
```bash
docker-compose logs -f | grep -E "error|warning|Chromium"
```

### Status do PM2
```bash
docker-compose exec wppconnect pm2 monit
```

## Se ainda tiver problemas

1. **Parar tudo:**
```bash
./QUICK-FIX.sh
```

2. **Rebuild completo:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

3. **Verificar PM2:**
```bash
docker-compose exec wppconnect pm2 logs --lines 100
```

---

**Agora com PM2, o problema de locks está 99% resolvido!** 🎉

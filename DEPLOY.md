# 🚀 WPPConnect Server - Guia de Deploy

## Problema Resolvido

Este guia resolve o erro comum:
```
ERROR: The profile appears to be in use by another Chromium process (XXXXX)
```

## Deploy Seguro

### Método 1: Script Automático (Recomendado)

```bash
./deploy.sh
```

O script faz automaticamente:
- ✅ Para containers antigos
- ✅ Remove arquivos de lock do Chromium
- ✅ Faz build da nova imagem
- ✅ Sobe novos containers
- ✅ Mostra logs em tempo real

### Método 2: Manual

```bash
# 1. Parar containers antigos
docker-compose down

# 2. Limpar locks (se necessário)
find ./wppconnect_userdata -name "SingletonLock" -delete
find ./wppconnect_userdata -name "SingletonSocket" -delete
find ./wppconnect_userdata -name "SingletonCookie" -delete

# 3. Build e iniciar
docker-compose build
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

## Estrutura de Volumes

```
./wppconnect_tokens     → Tokens de autenticação (persistente)
./wppconnect_userdata   → Dados das sessões WhatsApp (persistente)
```

⚠️ **Importante:** Esses diretórios são criados automaticamente e persistem entre deployments.

## Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Reiniciar sem rebuild
docker-compose restart

# Parar containers
docker-compose stop

# Parar e remover containers
docker-compose down

# Limpar tudo (incluindo volumes)
docker-compose down -v
# ⚠️ Cuidado: isso remove TODAS as sessões salvas!
```

## Troubleshooting

### Erro: Profile in use

**Solução rápida:**
```bash
./deploy.sh
```

**Solução manual:**
```bash
docker-compose down
rm -rf ./wppconnect_userdata/*/SingletonLock
docker-compose up -d
```

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs wppconnect

# Verificar se a porta está em uso
lsof -i :21465
```

### Limpar sessões corrompidas

```bash
# Para o servidor
docker-compose down

# Remove dados da sessão específica
rm -rf ./wppconnect_userdata/tarcisiodier

# Inicia novamente
docker-compose up -d
```

## Configurações

Edite o arquivo `.env`:

```env
# Porta do servidor
PORT=21465

# Não enviar mensagens da API para webhook
WEBHOOK_SEND_API=false

# Controlar self messages
WEBHOOK_ON_SELF_MESSAGE=false
```

## Logs

Para debug detalhado, adicione no `.env`:

```env
LOG_LEVEL=debug
```

**Lembre-se:** Volte para `LOG_LEVEL=error` em produção para performance.

## Backup

```bash
# Backup completo
tar -czf backup-$(date +%Y%m%d).tar.gz \
  wppconnect_tokens \
  wppconnect_userdata \
  .env

# Restaurar
tar -xzf backup-YYYYMMDD.tar.gz
```

## Monitoramento

```bash
# Uso de recursos
docker stats wpp-server

# Processos dentro do container
docker-compose exec wppconnect ps aux
```

## Segurança

⚠️ **Nunca versione:**
- `.env` (contém SECRET_KEY)
- `wppconnect_tokens/` (contém tokens de sessão)
- `wppconnect_userdata/` (contém dados do WhatsApp)

Esses diretórios já estão no `.gitignore`.

---

**Dúvidas?** Verifique os logs com `docker-compose logs -f`

---
name: wppconnect-docker
description: >-
  Builds and runs WPPConnect Server with Docker Compose, including Chrome/Puppeteer
  dependencies, config volumes, and token persistence. Use for Dockerfile, docker-compose,
  container debugging, or production deployment of this server.
---

# WPPConnect Docker

## Arquivos

- `Dockerfile` — imagem da API
- `docker-compose.yml` — serviço `wppconnect`, porta **21465**
- `.dockerignore` — exclusões de build

## Compose atual

```yaml
ports: "21465:21465"
volumes:
  - ./config.ts → /usr/src/wpp-server/config.ts
  - ./wppconnect_tokens → tokens das sessões
```

## Config no container

O compose espera `config.ts` na **raiz do projeto**. O código-fonte usa `src/config.ts`.

Opções:

1. Copiar/symlink: `cp src/config.ts config.ts` antes do `docker compose up`
2. Ajustar volume para `src/config.ts` (se o path interno da imagem permitir)
3. Manter `config.ts` na raiz só para Docker (gitignore se for local)

## Requisitos Puppeteer/Chrome

A imagem precisa das libs do README (fontes, libgbm, nss, etc.). Sem isso: sessão falha ao iniciar Chrome.

Debug:

```bash
docker compose build --no-cache
docker compose up
docker logs wpp-server -f
```

## Produção

- Trocar `secretKey` no config montado.
- Persistir volume `wppconnect_tokens` (backup).
- `restart: unless-stopped` já no compose.
- Não expor 21465 publicamente sem reverse proxy + TLS + auth na borda.

## Variáveis úteis

- `PORT` — sobrescreve porta (middleware em `index.ts` usa `process.env.PORT || serverOptions.port`).

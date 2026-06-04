---
name: wppconnect-server
description: >-
  Guides work on WPPConnect Server — Node/Express/TypeScript WhatsApp REST API
  with multi-session wppconnect, webhooks, Socket.IO, and token stores. Use when
  editing this repo, sessions, config, wppconnect integration, or custom fork changes.
---

# WPPConnect Server

## Quick map

| Área | Path |
|------|------|
| Boot | `src/server.ts`, `src/index.ts` |
| Config | `src/config.ts`, `types/ServerOptions.ts` |
| Rotas | `src/routes/index.ts` |
| Sessão WhatsApp | `src/util/createSessionUtil.ts`, `sessionController.ts` |
| Estado global | `src/util/sessionUtil.ts` (`clientsArray`, `eventEmitter`) |
| Tokens persistidos | `src/util/tokenStore/` (factory: file/redis/mongo/firebase) |
| Webhook | `src/util/functions.ts` (`callWebHook`, `autoDownload`) |
| Event → cliente | `src/mapper/*` |

## Fluxo de sessão

1. Cliente chama start-session / generate-token.
2. `CreateSessionUtil.createSessionUtil` → `create()` do wppconnect com `createOptions` do config.
3. QR/status via callbacks; tokens salvos no store configurado (`tokenStoreType`).
4. Mensagens/eventos disparam webhook (se `url` setada) e Socket.IO.

## Config crítica

- `secretKey` — geração/validação de token (trocar em produção).
- `startAllSession` — reinicia todas as sessões no boot.
- `webhook.*` — eventos enviados; `ignore` filtra tipos.
- `createOptions.browserArgs` — Chrome headless; essencial no Docker.
- `customUserDataDir` — perfil Puppeteer por sessão (multi-device).

## Checklist antes de PR

1. `yarn lint` e `yarn test` (se tocou `util/` ou lógica de sessão).
2. `yarn build` sem erro.
3. Sem secrets, tokens ou `userDataDir/` no diff.
4. Commit conventional: `feat:`, `fix:`, `chore:`.

## Anti-patterns

- Editar só `dist/` sem `src/`.
- Nova rota sem `verifyToken` quando outras da mesma família usam.
- Refatorar controllers inteiros fora do escopo.
- Assumir `config.ts` na raiz — fonte é `src/config.ts` (Docker pode montar cópia).

## Referência

- `.cursor/AGENTS.md` — visão completa
- README — instalação Chrome/Puppeteer, variáveis de ambiente

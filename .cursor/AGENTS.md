# WPPConnect Server — guia para agentes

API REST em **Node.js 22 + TypeScript + Express** para automação do WhatsApp via [@wppconnect-team/wppconnect](https://github.com/wppconnect-team/wppconnect). Fork/customização em `chore/custom-updates`.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node `22.22.2`, Yarn `4.14.1` |
| HTTP | Express 4, Socket.IO |
| Build | Babel (`src` → `dist`), `tsc` para tipos |
| Dev | `yarn dev` → `tsx watch src/server.ts` |
| Testes | Jest (`src/tests/`) |
| Docs API | Swagger (`src/swagger.json`, `/api-docs`) |
| Sessões | Puppeteer/Chrome via wppconnect |
| Tokens | `file` \| `redis` \| `mongodb` \| `firebase` (`util/tokenStore/`) |

## Arquitetura (ordem de boot)

1. `src/server.ts` → `initServer(config)` em `src/index.ts`
2. Express + CORS + middleware (injeta `serverOptions`, `logger`, `io`)
3. `src/routes/index.ts` — rotas `/api/:session/...`
4. `CreateSessionUtil` — cria cliente wppconnect, webhooks, Socket.IO
5. `clientsArray` + `eventEmitter` em `util/sessionUtil.ts`

## Onde editar

| Tarefa | Caminho |
|--------|---------|
| Config padrão | `src/config.ts` (tipos em `types/ServerOptions.ts`) |
| Nova rota | `src/routes/index.ts` + controller em `src/controller/` |
| Auth token | `src/middleware/auth.ts` (`session:token` no path) |
| Webhook / eventos | `src/util/functions.ts`, `createSessionUtil.ts` |
| Mappers resposta | `src/mapper/` |
| Sessão / QR | `src/controller/sessionController.ts` |
| Docker | `Dockerfile`, `docker-compose.yml` |

## Comandos

```bash
yarn install
yarn dev          # desenvolvimento
yarn build        # dist/
yarn start        # produção (após build)
yarn lint
yarn test
```

## Convenções do repositório

- Commits: **Conventional Commits** (`feat`, `fix`, `build`, `chore`) — Husky + commitlint
- ESLint + Prettier; `simple-import-sort` obrigatório
- Licença Apache-2.0 — manter header de copyright nos arquivos novos
- Mudanças mínimas; não refatorar fora do escopo
- Branch de trabalho: `chore/custom-updates`; `main` estável

## Skills e regras deste repo

- Regras: `.cursor/rules/*.mdc`
- Skills do projeto: `.cursor/skills/*/SKILL.md`
- Skills globais recomendadas: `.cursor/README.md`

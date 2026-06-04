# Cursor — WPPConnect Server

Configuração local para o agente trabalhar neste repositório.

## Estrutura

```
.cursor/
├── AGENTS.md              # Visão geral e mapa do código
├── README.md              # Este arquivo
├── rules/                 # Regras automáticas (.mdc)
│   ├── project-core.mdc
│   ├── typescript-backend.mdc
│   ├── api-routes.mdc
│   └── docker.mdc
└── skills/                # Skills específicas do projeto
    ├── wppconnect-server/
    ├── wppconnect-api/
    └── wppconnect-docker/
```

## Skills do projeto (já no repo)

| Skill | Quando usar |
|-------|-------------|
| `wppconnect-server` | Qualquer tarefa no repo — arquitetura, sessões, config |
| `wppconnect-api` | Novas rotas, controllers, Swagger, autenticação |
| `wppconnect-docker` | Docker, compose, deploy, volumes, Chrome no container |

No chat: mencione o nome da skill ou peça para seguir `.cursor/skills/...`.

## Skills globais recomendadas (instalar no Cursor)

Estas ficam em `~/.cursor/skills/` ou `~/.agents/skills/`. Instale as que ainda não tiver (`npx skills add` ou copie o diretório).

| Prioridade | Skill | Motivo |
|------------|-------|--------|
| Alta | `cc-skill-backend-patterns` | Express, APIs, camadas |
| Alta | `cc-skill-coding-standards` | TS/Node, estilo consistente |
| Alta | `cc-skill-security-review` | `secretKey`, tokens, webhooks |
| Alta | `docker-expert` | Dockerfile, Puppeteer/Chrome, compose |
| Média | `javascript-typescript-jest` | Testes em `src/tests/` |
| Média | `api-design-principles` | REST, rotas `/api/:session` |
| Média | `nodejs-backend-patterns` | Middleware, erros, async |
| Média | `typescript-expert` | Tipos, refactors TS |
| Baixa | `commit` ou `caveman-commit` | Mensagens conventional |
| Baixa | `observe-whatsapp` | Debug de entrega/webhook (conceitos) |

Domínio WhatsApp (opcional): `automate-whatsapp` (Kapso), `twilio-communications` — úteis para integrações, não substituem wppconnect.

## MCP útil

- **context7** — documentação atual de Express, wppconnect, Socket.IO
- **cursor-ide-browser** — testar `/api-docs` e fluxos HTTP locais

## Branch atual

Trabalho em `chore/custom-updates`; merge para `main` via PR quando estável.

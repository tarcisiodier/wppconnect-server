---
name: wppconnect-api
description: >-
  Adds or changes REST endpoints, Express controllers, middleware, and Swagger
  for WPPConnect Server. Use for new routes, auth, message/session APIs, or
  API contract changes under src/routes and src/controller.
---

# WPPConnect API

## Adicionar endpoint

1. **Controller** — `src/controller/<area>Controller.ts`: função async `(req, res)`.
2. **Rota** — `src/routes/index.ts`:
   - Sessão autenticada: `verifyToken` (+ `statusConnection` se precisa de cliente ativo).
   - Upload: `upload.single('file')` como nas rotas de mídia existentes.
3. **Swagger** — atualizar `src/swagger.json` ou fluxo `yarn docs` se expor na doc pública.
4. **Teste manual** — `requests.http` ou Postman collection do README.

## Padrão de rota

```text
POST   /api/:session/send-message          → MessageController
GET    /api/:session/check-connection-session → SessionController + verifyToken
POST   /api/:secretkey/start-all           → operações globais (secretKey no path)
```

## Auth

- `verifyToken` (`middleware/auth.ts`): path `nomeSessao:tokenBcrypt` ou header `Authorization`.
- `req.client` — instância wppconnect após middleware de conexão.
- `req.serverOptions` — config mergeada (middleware em `index.ts`).

## Resposta

- Sucesso: `res.status(200).send({ status: 'success', response: ..., session })`.
- Erro: status 4xx/5xx + `{ message: '...' }` (seguir controllers vizinhos).
- Mapper opcional: corpo com `mapper: { type: '...' }` se feature habilitada.

## Controllers por domínio

| Controller | Responsabilidade |
|------------|------------------|
| `sessionController` | QR, start/close, connection |
| `messageController` | envio texto/mídia, listagens |
| `groupController` | grupos, invites |
| `contactController` | contatos |
| `deviceController` | perfil, bateria, host |
| `miscController` | utilitários diversos |

## Segurança

- Nunca logar `secretKey` nem tokens completos.
- Validar `session` no path antes de usar em `clientsArray`.
- Rate/size: body limit 50mb já no Express — não aumentar sem motivo.

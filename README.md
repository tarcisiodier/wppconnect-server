# WPPConnect Team

## _WPPConnect Server_

![WPPConnect-SERVER](https://i.imgur.com/y1ts6RR.png)

[![npm version](https://img.shields.io/npm/v/@wppconnect/server.svg?color=green)](https://www.npmjs.com/package/@wppconnect/server)
[![Downloads](https://img.shields.io/npm/dm/@wppconnect/server.svg)](https://www.npmjs.com/package/@wppconnect/server)
[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/wppconnect-team/wppconnect-server.svg)](https://isitmaintained.com/project/wppconnect-team/wppconnect-server 'Average time to resolve an issue')
[![Percentage of issues still open](https://isitmaintained.com/badge/open/wppconnect-team/wppconnect-server.svg)](https://isitmaintained.com/badge/open/wppconnect-team/wppconnect-server.svg 'Percentage of issues still open')
[![Build Status](https://img.shields.io/github/actions/workflow/status/wppconnect-team/wppconnect-server/build.yml)](https://github.com/wppconnect-team/wppconnect-server/actions)
[![Build](https://github.com/wppconnect-team/wppconnect-server/actions/workflows/build.yml/badge.svg)](https://github.com/wppconnect-team/wppconnect-server/actions/workflows/build.yml)
[![release-it](https://img.shields.io/badge/%F0%9F%93%A6%F0%9F%9A%80-release--it-e10079.svg)](https://github.com/release-it/release-it)

Welcome to the **WPPConnect Server** repository, developed by the WPPConnect Team. Our mission is to provide a robust and ready-to-use API for seamless communication with WhatsApp. The server is designed to streamline the process of sending and receiving messages, managing contacts, creating groups, and much more, all while leveraging the power of JavaScript ES6, NodeJS, and a RESTful architecture.

- Javascript ES6
- NodeJS
- Restfull

## Our online channels

Connect with us across various platforms to stay updated and engage in discussions:

[![Discord](https://img.shields.io/discord/844351092758413353?color=blueviolet&label=Discord&logo=discord&style=flat)](https://discord.gg/JU5JGGKGNG)
[![Telegram Group](https://img.shields.io/badge/Telegram-Group-32AFED?logo=telegram)](https://t.me/wppconnect)
[![WhatsApp Group](https://img.shields.io/badge/WhatsApp-Group-25D366?logo=whatsapp)](https://chat.whatsapp.com/LJaQu6ZyNvnBPNAVRbX00K)
[![YouTube](https://img.shields.io/youtube/channel/subscribers/UCD7J9LG08PmGQrF5IS7Yv9A?label=YouTube)](https://www.youtube.com/c/wppconnect)

## Documentations

Detailed documentation and guides are available for your convenience:

- [Postman](https://documenter.getpostman.com/view/9139457/TzshF4jQ)
- [Swagger](https://wppconnect.io/swagger/wppconnect-server)
- Swagger UI can be accessed on your server through the route: "IP:PORT/api-docs"

## Features

|                                      |     |
| ------------------------------------ | --- |
| Multiple Sessions                    | ✔   |
| Send **text, image, video and docs** | ✔   |
| Get **contacts list**                | ✔   |
| Manage products                      | ✔   |
| Receive/Send messages                | ✔   |
| Open/Close Session                   | ✔   |
| Change Profile/Username              | ✔   |
| Create Group                         | ✔   |
| Join Group by Invite Code            | ✔   |
| Webhook                              | ✔   |

## Libraries Used

- WPPConnect
- Axios
- Bcrypt
- Cors
- Dotenv
- Express
- Nodemon
- SocketIO
- S3

## Installation

Install the dependencies and start the server.

```sh
yarn install
//or
npm install
```

## Install puppeteer dependencies:

```sh
sudo apt-get install -y libxshmfence-dev libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils libvips-dev

```

## Install google chrome

```sh

wget -c https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

sudo apt-get update

sudo apt-get install libappindicator1

sudo dpkg -i google-chrome-stable_current_amd64.deb

```

### Troubleshooting
 If you encounter installation issues, please try the procedures below
 . Error Sharp Runtime
```sh
    yarn add sharp
    npm install --include=optional sharp
    //or
    yarn add sharp --ignore-engines
```

## Run Server

```sh
yarn dev
```

## Build Server

```sh
yarn build
```

## Deploy em Produção com PM2

O PM2 é um gerenciador de processos para aplicações Node.js que permite manter sua aplicação sempre ativa, reiniciar automaticamente em caso de falhas e gerenciar logs de forma eficiente.

### Instalação do PM2

Instale o PM2 globalmente no servidor de produção:

```sh
# Usando npm (recomendado para instalação global)
sudo npm install -g pm2

# Ou usando yarn (se preferir)
sudo yarn global add pm2
```

### Build da Aplicação

Antes de iniciar com PM2, certifique-se de que a aplicação foi compilada:

```sh
yarn build
```

### Iniciar Aplicação com PM2

Navegue até o diretório onde o wppconnect-server está localizado e execute:

**Opção 1 - Usando yarn (recomendado):**

```sh
pm2 start yarn --name wppconnect-server -- start
```

**Opção 2 - Usando o script diretamente:**

```sh
pm2 start dist/server.js --name wppconnect-server
```

**Opção 3 - Usando o arquivo ecosystem.config.js (recomendado para produção):**

```sh
pm2 start ecosystem.config.js
```

### Comandos Úteis do PM2

#### Visualizar Status das Aplicações

```sh
pm2 status
# ou
pm2 list
```

#### Visualizar Logs

Visualizar logs de todas as aplicações:

```sh
pm2 logs
```

Visualizar logs apenas do wppconnect-server:

```sh
pm2 logs wppconnect-server
```

Visualizar últimos logs (útil para monitoramento):

```sh
pm2 logs wppconnect-server --lines 100
```

#### Gerenciar Aplicação

Parar a aplicação:

```sh
pm2 stop wppconnect-server
```

Reiniciar a aplicação:

```sh
pm2 restart wppconnect-server
```

Recarregar a aplicação (zero downtime):

```sh
pm2 reload wppconnect-server
```

Deletar a aplicação do PM2:

```sh
pm2 delete wppconnect-server
```

#### Monitoramento

Monitorar recursos em tempo real:

```sh
pm2 monit
```

Visualizar informações detalhadas:

```sh
pm2 show wppconnect-server
```

### Configurar Inicialização Automática

Para que a aplicação inicie automaticamente quando o servidor reiniciar:

```sh
# Gerar script de inicialização
pm2 startup

# Salvar a configuração atual do PM2
pm2 save
```

O comando `pm2 startup` irá gerar e configurar um script de inicialização baseado no seu sistema operacional.

### Configuração Avançada com Arquivo ecosystem.config.js

Para configurações mais avançadas, você pode criar um arquivo `ecosystem.config.js` na raiz do projeto:

```javascript
module.exports = {
  apps: [
    {
      name: 'wppconnect-server',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '21465',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
```

Depois, inicie com:

```sh
pm2 start ecosystem.config.js
```

### Logs

Os logs são extremamente importantes para monitoramento e debugging. Com PM2, você pode:

- **Visualizar logs em tempo real**: `pm2 logs wppconnect-server`
- **Limpar logs**: `pm2 flush`
- **Configurar rotação de logs**: Use o módulo `pm2-logrotate`:

```sh
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Usando PM2 no Docker

Para usar PM2 no Docker, você precisa modificar o Dockerfile para instalar o PM2 e usar o `ecosystem.config.js` como ponto de entrada.

#### Dockerfile com PM2

Atualize o Dockerfile para incluir PM2:

```dockerfile
FROM node:22.21.1-alpine AS base
WORKDIR /usr/src/wpp-server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install build dependencies and runtime libraries for sharp
RUN apk update && \
    apk add --no-cache \
    vips \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat \
    pkgconfig \
    python3 \
    && rm -rf /var/cache/apk/*

# To make sure yarn 4 uses node-modules linker
COPY .yarnrc.yml ./

# Copy only package.json to leverage Docker cache
COPY package.json ./
COPY yarn.lock ./

# Enable corepack and prepare yarn 4.12.0
RUN corepack enable && \
    corepack prepare yarn@4.12.0 --activate

# Install dependencies with immutable lockfile
RUN yarn install --immutable

FROM base AS build
WORKDIR /usr/src/wpp-server
COPY . .
RUN yarn install
RUN yarn build

FROM build AS runtime
WORKDIR /usr/src/wpp-server/

# Install runtime dependencies (chromium and vips libraries)
RUN apk add --no-cache \
    chromium \
    vips \
    fftw

# Install PM2 globally
RUN npm install -g pm2

# Copy ecosystem config file
COPY ecosystem.config.js ./

EXPOSE 21465

# Use PM2 to start the application
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

#### Atualizar ecosystem.config.js para Docker

Certifique-se de que o `ecosystem.config.js` está configurado corretamente:

```javascript
module.exports = {
  apps: [
    {
      name: 'wppconnect-server',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || '21465',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
```

#### Comandos Docker

**Build da imagem:**

```sh
docker build -t wppconnect-server .
```

**Executar com docker-compose:**

```sh
docker-compose up -d
```

**Visualizar logs:**

```sh
# Logs do container (recomendado - mostra todos os logs do PM2)
docker-compose logs -f wppconnect

# Ou logs do PM2 dentro do container
docker exec -it wpp-server pm2 logs

# Logs em tempo real do PM2
docker exec -it wpp-server pm2 logs wppconnect-server --lines 100
```

**Nota sobre logs:** Quando usado com `pm2-runtime` no Docker, o PM2 automaticamente redireciona os logs para stdout/stderr, permitindo que você veja todos os logs usando `docker logs` ou `docker-compose logs`. Os arquivos de log configurados no `ecosystem.config.js` também são criados dentro do container para referência.

**Gerenciar aplicação:**

```sh
# Status do PM2 dentro do container
docker exec -it wpp-server pm2 status

# Reiniciar aplicação via PM2
docker exec -it wpp-server pm2 restart wppconnect-server

# Monitorar recursos
docker exec -it wpp-server pm2 monit
```

**Nota:** O `pm2-runtime` é usado no Docker em vez de `pm2 start` porque ele mantém o processo em primeiro plano, necessário para containers Docker. O PM2 ainda fornece todos os benefícios de monitoramento e reinicialização automática.

---

# Configuração do Nginx como Reverse Proxy

Para usar o Nginx como reverse proxy na frente da aplicação (recomendado para produção), você pode usar o arquivo de exemplo `nginx.conf.example`.

## Instalação do Nginx

```sh
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

## Configuração

1. **Copie o arquivo de exemplo:**

```sh
sudo cp nginx.conf.example /etc/nginx/sites-available/wppconnect-server
```

2. **Edite a configuração:**

```sh
sudo nano /etc/nginx/sites-available/wppconnect-server
```

3. **Ajuste as seguintes configurações:**

- `server_name`: Substitua `seu-dominio.com` pelo seu domínio
- `upstream`: Verifique se a porta `21465` corresponde à porta da sua aplicação
- Se usar HTTPS, descomente e configure a seção SSL

4. **Habilite o site:**

```sh
sudo ln -s /etc/nginx/sites-available/wppconnect-server /etc/nginx/sites-enabled/
```

5. **Teste a configuração:**

```sh
sudo nginx -t
```

6. **Recarregue o Nginx:**

```sh
sudo systemctl reload nginx
# ou
sudo service nginx reload
```

## Configuração SSL com Let's Encrypt (Opcional)

Para habilitar HTTPS:

```sh
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# O Certbot configurará automaticamente o SSL
```

## Características da Configuração

- **Suporte a WebSocket**: Configurado para Socket.IO funcionar corretamente
- **Upload de arquivos grandes**: `client_max_body_size` configurado para 50MB
- **Timeouts aumentados**: Para operações longas do WhatsApp
- **Balanceamento de carga**: Preparado para múltiplas instâncias (comente/descomente no upstream)
- **Cache de arquivos estáticos**: Configurado para `/files`

## Verificar Status

```sh
# Status do Nginx
sudo systemctl status nginx

# Logs de acesso
sudo tail -f /var/log/nginx/wppconnect-access.log

# Logs de erro
sudo tail -f /var/log/nginx/wppconnect-error.log
```

---

# Variáveis de Ambiente

O projeto suporta configuração via variáveis de ambiente usando arquivo `.env`. Todas as configurações podem ser definidas através de variáveis de ambiente, facilitando o gerenciamento entre ambientes de desenvolvimento e produção.

## Configuração do Arquivo .env

1. **Copie o arquivo de exemplo:**

```sh
cp .env.example .env
```

2. **Edite o arquivo `.env`** com suas configurações específicas.

## Variáveis Principais

### Ambiente da Aplicação

```bash
# development | production | test
NODE_ENV=development
```

### Configurações Básicas

```bash
SECRET_KEY=THISISMYSECURETOKEN  # IMPORTANTE: Altere em produção!
HOST=http://localhost
PORT=21465
DEVICE_NAME=WppConnect
POWERED_BY=WPPConnect-Server
```

### Configurações de Log

```bash
# Níveis: error | warn | info | verbose | debug | silly
LOG_LEVEL=silly

# Loggers: console,file (separados por vírgula)
LOG_LOGGER=console,file
```

### Configurações de Banco de Dados

```bash
# MongoDB
MONGODB_DATABASE=tokens
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGO_IS_REMOTE=false
MONGO_URL_REMOTE=

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Uso com PM2

O `ecosystem.config.js` está configurado para passar automaticamente todas as variáveis de ambiente do sistema para o PM2. Isso significa que:

1. **Variáveis definidas no `.env`** serão carregadas automaticamente pelo `dotenv`
2. **Variáveis passadas para o PM2** estarão disponíveis na aplicação
3. **Variáveis do sistema** também serão passadas

### Exemplo de uso:

```bash
# Definir variáveis antes de iniciar
export NODE_ENV=production
export PORT=3000
pm2 start ecosystem.config.js

# Ou usar arquivo .env
# O dotenv carregará automaticamente as variáveis
pm2 start ecosystem.config.js
```

## Variáveis Disponíveis

Consulte o arquivo `.env.example` para ver todas as variáveis de ambiente disponíveis e suas descrições.

---

# Configuration

This server use config.ts file to define some options, default values are:

```javascript
{
  /* secret key to generate access token */
  secretKey: 'THISISMYSECURETOKEN',
  host: 'http://localhost',
  port: '21465',
  // Device name for show on whatsapp device
  deviceName: 'WppConnect',
  poweredBy: 'WPPConnect-Server',
  // starts all sessions when starting the server.
  startAllSession: true,
  tokenStoreType: 'file',
  // sets the maximum global listeners. 0 = infinity.
  maxListeners: 15,
  // create userDataDir for each puppeteer instance for working with Multi Device
  customUserDataDir: './userDataDir/',
  webhook: {
    // set default webhook
    url: null,
    // automatically downloads files to upload to the webhook
    autoDownload: true,
    // enable upload to s3
    uploadS3: false,
    // set default bucket name on aws s3
    awsBucketName: null,
    //marks messages as read when the webhook returns ok
    readMessage: true,
    //sends all unread messages to the webhook when the server starts
    allUnreadOnStart: false,
    // send all events of message status (read, sent, etc)
    listenAcks: true,
    // send all events of contacts online or offline for webook and socket
    onPresenceChanged: true,
    // send all events of groups participants changed for webook and socket
    onParticipantsChanged: true,
    // send all events of reacted messages for webook and socket
    onReactionMessage: true,
    // send all events of poll messages for webook and socket
    onPollResponse: true,
    // send all events of revoked messages for webook and socket
    onRevokedMessage: true,
    // send all events of labels for webook and socket
    onLabelUpdated: true,
    // 'event', 'from' or 'type' to ignore and not send to webhook
    ignore: [],
  },
  websocket: {
    // Just leave one active, here or on webhook.autoDownload
    autoDownload: false,
    // Just leave one active, here or on webhook.uploadS3, to avoid duplication in S3
    uploadS3: false,
  },
  // send data to chatwoot
  chatwoot: {
    sendQrCode: true,
    sendStatus: true,
  },
  //functionality that archives conversations, runs when the server starts
  archive: {
    enable: false,
    //maximum interval between filings.
    waitTime: 10,
    daysToArchive: 45,
  },
  log: {
    level: 'silly', // Before open a issue, change level to silly and retry an action
    logger: ['console', 'file'],
  },
  // create options for using on wppconnect-lib
  createOptions: {
    browserArgs: [
      '--disable-web-security',
      '--no-sandbox',
      '--disable-web-security',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
      '--disable-features=LeakyPeeker' // Disable the browser's sleep mode when idle, preventing the browser from going into sleep mode, this is useful for WhatsApp not to be in economy mode in the background, avoiding possible crashes
    ],
  },
  mapper: {
    enable: false,
    prefix: 'tagone-',
  },
  // Configurations for connect with database
  db: {
    mongodbDatabase: 'tokens',
    mongodbCollection: '',
    mongodbUser: '',
    mongodbPassword: '',
    mongodbHost: '',
    mongoIsRemote: true,
    mongoURLRemote: '',
    mongodbPort: 27017,
    redisHost: 'localhost',
    redisPort: 6379,
    redisPassword: '',
    redisDb: 0,
    redisPrefix: 'docker',
  },
  // Your configurations to upload on AWS
  aws_s3: {
    region: 'sa-east-1',
    access_key_id: '',
    secret_key: '',
    // If you already have a bucket created that will be used. Will be stored: you-default-bucket/{session}/{filename}
    defaultBucketName: ''
  },
}
```

# Secret Key

Your `secretKey` is inside the `config.ts` file. You must change the default value to one that only you know.

<!-- ![Peek 2021-03-25 09-33](https://user-images.githubusercontent.com/40338524/112473515-3b310a80-8d4d-11eb-94bb-ff409c91d9b8.gif) -->

# Generate Token

To generate an access token, you must use your `SECRET_KEY`.

Using the route:

```shell
  curl -X POST --location "http://localhost:21465/api/mySession/THISISMYSECURETOKEN/generate-token"
```

### Response:

```json
{
  "status": "Success",
  "session": "mySession",
  "token": "$2b$10$duQ5YYV6fojn5qFiFv.aEuY32_SnHgcmxdfxohnjG4EHJ5_Z6QWhe",
  "full": "wppconnect:$2b$10$duQ5YYV6fojn5qFiFv.aEuY32_SnHgcmxdfxohnjG4EHJ5_Z6QWhe"
}
```

# Using Token

Save the value of the "full" response. Then use this value to call the routes.

# Examples

```sh
#Starting Session
# /api/:session/start-session

curl -X POST --location "http://localhost:21465/api/mySession/start-session" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer \$2b\$10\$JcHd97xHN6ErBuiLd7Yu4.r6McvOvEZZDQTQwev2MRK_zQObUZZ9C"
```

```sh
#Get QrCode
# /api/:session/start-session
# when the session is starting if the method is called again it will return the base64 qrCode

curl -X POST --location "http://localhost:21465/api/mySession/start-session" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer \$2b\$10\$JcHd97xHN6ErBuiLd7Yu4.r6McvOvEZZDQTQwev2MRK_zQObUZZ9C"
```

```sh
#Send Message
# /api/:session/send-message
curl -X POST --location "http://localhost:21465/api/mySession/send-message" \
    -H "Content-Type: application/json; charset=utf-8" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer \$2b\$10\$8aQFQxnWREtBEMZK_iHMe.u7NeoNkjL7s6NYai_83Pb31Ycss6Igm" \
    -d "{
          \"phone\": \"5511900000000\",
          \"message\": \"*Abner* Rodrigues\"
        }"
```

See the `routes` file for all the routes. [here](/src/routes/index.js) and HTTP [file](/requests.http).

# Swagger UI

Swagger ui can be found at `/api-docs`

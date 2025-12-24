/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { create, SocketState, StatusFind } from '@wppconnect-team/wppconnect';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

import { download } from '../controller/sessionController';
import { WhatsAppServer } from '../types/WhatsAppServer';
import chatWootClient from './chatWootClient';
import { autoDownload, callWebHook, startHelper } from './functions';
import { clientsArray, eventEmitter } from './sessionUtil';
import Factory from './tokenStore/factory';

export default class CreateSessionUtil {
  startChatWootClient(client: any) {
    if (client.config.chatWoot && !client._chatWootClient)
      client._chatWootClient = new chatWootClient(
        client.config.chatWoot,
        client.session
      );
    return client._chatWootClient;
  }

  async createSessionUtil(
    req: any,
    clientsArray: any,
    session: string,
    res?: any
  ) {
    try {
      let client = this.getClient(session) as any;
      if (client.status != null && client.status !== 'CLOSED') return;
      client.status = 'INITIALIZING';
      client.config = req.body;

      const tokenStore = new Factory();
      const myTokenStore = tokenStore.createTokenStory(client);
      const tokenData = await myTokenStore.getToken(session);

      // we need this to update phone in config every time session starts, so we can ask for code for it again.
      myTokenStore.setToken(session, tokenData ?? {});

      this.startChatWootClient(client);

      if (req.serverOptions.customUserDataDir) {
        // Adiciona container ID ao path para evitar conflitos entre containers Docker
        // Isso garante que cada container tenha seu próprio diretório de perfil
        const containerId = process.env.HOSTNAME || 'default';
        const userDataDirPath = req.serverOptions.customUserDataDir + `${session}_${containerId}`;
        
        req.logger?.info(`[${session}] Using userDataDir: ${userDataDirPath} (container: ${containerId})`);
        
        // Limpeza agressiva de locks e processos Chromium órfãos
        try {
          req.logger?.info(`[${session}] Starting aggressive lock cleanup for: ${userDataDirPath}`);
          
          // 1. Mata processos Chromium órfãos que possam estar usando o perfil
          try {
            // Procura processos Chromium que possam estar usando o userDataDir
            const killChromiumProcesses = async () => {
              try {
                // Tenta encontrar processos Chromium relacionados ao userDataDir
                const { stdout } = await execAsync(`ps aux | grep -i chromium | grep -v grep || true`);
                const processes = stdout.trim().split('\n').filter(p => p.includes(userDataDirPath));
                
                if (processes.length > 0) {
                  req.logger?.warn(`[${session}] Found ${processes.length} potential Chromium processes`);
                  // Tenta matar processos relacionados (cuidado: pode matar processos legítimos)
                  // Por segurança, apenas logamos por enquanto
                  processes.forEach((proc: string) => {
                    const pid = proc.trim().split(/\s+/)[1];
                    if (pid) {
                      req.logger?.info(`[${session}] Found Chromium process PID: ${pid}`);
                      // Não matamos automaticamente para evitar problemas
                    }
                  });
                }
              } catch (e: any) {
                // Ignora erros ao procurar processos
              }
            };
            
            await killChromiumProcesses();
          } catch (e: any) {
            req.logger?.warn(`[${session}] Error checking Chromium processes: ${e?.message}`);
          }
          
          // 2. Lista completa de arquivos de lock do Chromium
          const lockFiles = [
            path.join(userDataDirPath, 'SingletonLock'),
            path.join(userDataDirPath, 'lockfile'),
            path.join(userDataDirPath, 'SingletonSocket'),
            path.join(userDataDirPath, 'SingletonCookie'),
            path.join(userDataDirPath, 'chrome_debug.log'),
            path.join(userDataDirPath, 'chrome_debug.log.old'),
            path.join(userDataDirPath, '.org.chromium.Chromium.*'),
          ];
          
          // 3. Limpa locks em subdiretórios comuns
          const subDirs = ['Default', 'Profile 1', 'Profile 2', 'System Profile'];
          subDirs.forEach((subDir) => {
            const subDirPath = path.join(userDataDirPath, subDir);
            if (fs.existsSync(subDirPath)) {
              lockFiles.push(
                path.join(subDirPath, 'SingletonLock'),
                path.join(subDirPath, 'lockfile'),
                path.join(subDirPath, 'SingletonSocket'),
                path.join(subDirPath, 'SingletonCookie')
              );
            }
          });
          
          // 4. Função recursiva melhorada para encontrar e remover TODOS os locks
          const removeAllLocks = (dir: string, depth = 0) => {
            if (depth > 10) return; // Limite de profundidade para evitar loops
            
            try {
              if (!fs.existsSync(dir)) return;
              
              const files = fs.readdirSync(dir);
              files.forEach((file) => {
                const filePath = path.join(dir, file);
                try {
                  const stat = fs.statSync(filePath);
                  if (stat.isDirectory()) {
                    removeAllLocks(filePath, depth + 1);
                  } else if (
                    file.includes('Singleton') ||
                    file === 'lockfile' ||
                    file.startsWith('.org.chromium') ||
                    file.includes('chrome_debug') ||
                    file.endsWith('.lock')
                  ) {
                    try {
                      // Tenta remover com permissões completas
                      fs.chmodSync(filePath, 0o777);
                      fs.unlinkSync(filePath);
                      req.logger?.info(`[${session}] Removed lock: ${filePath}`);
                    } catch (e: any) {
                      req.logger?.warn(`[${session}] Could not remove ${filePath}: ${e?.message}`);
                    }
                  }
                } catch (e) {
                  // Ignora erros ao processar arquivos
                }
              });
            } catch (e) {
              // Ignora erros ao ler diretório
            }
          };
          
          // 5. Remove locks específicos com múltiplas tentativas
          let removedCount = 0;
          const maxAttempts = 3;
          
          for (const lockFile of lockFiles) {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              try {
                if (fs.existsSync(lockFile)) {
                  // Tenta remover com diferentes estratégias
                  try {
                    fs.chmodSync(lockFile, 0o777);
                    fs.unlinkSync(lockFile);
                    removedCount++;
                    req.logger?.info(`[${session}] Removed lock file (attempt ${attempt}): ${lockFile}`);
                    break; // Sucesso, sai do loop de tentativas
                  } catch (e: any) {
                    if (attempt === maxAttempts) {
                      req.logger?.warn(`[${session}] Failed to remove ${lockFile} after ${maxAttempts} attempts: ${e?.message}`);
                    } else {
                      // Aguarda um pouco antes de tentar novamente
                      await new Promise(resolve => setTimeout(resolve, 500));
                    }
                  }
                } else {
                  break; // Arquivo não existe, não precisa tentar mais
                }
              } catch (e: any) {
                if (attempt === maxAttempts) {
                  req.logger?.warn(`[${session}] Error processing ${lockFile}: ${e?.message}`);
                }
              }
            }
          }
          
          // 6. Limpeza recursiva adicional
          removeAllLocks(userDataDirPath);
          
          // 7. Remove diretórios de lock se existirem
          const lockDirs = [
            path.join(userDataDirPath, 'SingletonLock'),
            path.join(userDataDirPath, '.org.chromium.Chromium'),
          ];
          
          lockDirs.forEach((lockDir) => {
            try {
              if (fs.existsSync(lockDir) && fs.statSync(lockDir).isDirectory()) {
                fs.chmodSync(lockDir, 0o777);
                fs.rmSync(lockDir, { recursive: true, force: true });
                req.logger?.info(`[${session}] Removed lock directory: ${lockDir}`);
              }
            } catch (e: any) {
              req.logger?.warn(`[${session}] Failed to remove lock directory ${lockDir}: ${e?.message}`);
            }
          });
          
          // 8. Delay maior para garantir sincronização do filesystem
          if (removedCount > 0 || fs.existsSync(userDataDirPath)) {
            req.logger?.info(`[${session}] Cleaned ${removedCount} lock file(s), waiting for filesystem sync...`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Aumentado para 3 segundos
          }
          
          req.logger?.info(`[${session}] Lock cleanup completed`);
        } catch (e: any) {
          req.logger?.error(`[${session}] Error during lock cleanup: ${e?.message}`);
          // Mesmo com erro, continua tentando iniciar
        }
        
        req.serverOptions.createOptions.puppeteerOptions = {
          ...req.serverOptions.createOptions.puppeteerOptions,
          userDataDir: userDataDirPath,
        };
      }

      const wppClient = await create(
        Object.assign(
          {},
          { tokenStore: myTokenStore },
          client.config.proxy
            ? {
                proxy: {
                  url: client.config.proxy?.url,
                  username: client.config.proxy?.username,
                  password: client.config.proxy?.password,
                },
              }
            : {},
          req.serverOptions.createOptions,
          {
            session: session,
            phoneNumber: client.config.phone ?? null,
            deviceName:
              client.config.phone == undefined // bug when using phone code this shouldn't be passed (https://github.com/wppconnect-team/wppconnect-server/issues/1687#issuecomment-2099357874)
                ? client.config?.deviceName ||
                  req.serverOptions.deviceName ||
                  'WppConnect'
                : undefined,
            poweredBy:
              client.config.phone == undefined // bug when using phone code this shouldn't be passed (https://github.com/wppconnect-team/wppconnect-server/issues/1687#issuecomment-2099357874)
                ? client.config?.poweredBy ||
                  req.serverOptions.poweredBy ||
                  'WPPConnect-Server'
                : undefined,
            catchLinkCode: (code: string) => {
              this.exportPhoneCode(req, client.config.phone, code, client, res);
            },
            catchQR: (
              base64Qr: any,
              asciiQR: any,
              attempt: any,
              urlCode: string
            ) => {
              this.exportQR(req, base64Qr, urlCode, client, res);
            },
            onLoadingScreen: (percent: string, message: string) => {
              req.logger.info(`[${session}] ${percent}% - ${message}`);
            },
            statusFind: (statusFind: StatusFind) => {
              try {
                eventEmitter.emit(
                  `status-${client.session}`,
                  client,
                  statusFind
                );
                if (
                  statusFind === StatusFind.autocloseCalled ||
                  statusFind === StatusFind.disconnectedMobile
                ) {
                  client.status = 'CLOSED';
                  client.qrcode = null;
                  client.close();
                  clientsArray[session] = undefined;
                }
                callWebHook(client, req, 'status-find', {
                  status: statusFind,
                  session: client.session,
                });
                req.logger.info(statusFind + '\n\n');
              } catch (error) {}
            },
          }
        )
      );

      client = clientsArray[session] = Object.assign(wppClient, client);
      await this.start(req, client);

      if (req.serverOptions.webhook.onParticipantsChanged) {
        await this.onParticipantsChanged(req, client);
      }

      if (req.serverOptions.webhook.onReactionMessage) {
        await this.onReactionMessage(client, req);
      }

      if (req.serverOptions.webhook.onRevokedMessage) {
        await this.onRevokedMessage(client, req);
      }

      if (req.serverOptions.webhook.onPollResponse) {
        await this.onPollResponse(client, req);
      }
      if (req.serverOptions.webhook.onLabelUpdated) {
        await this.onLabelUpdated(client, req);
      }
    } catch (e) {
      req.logger.error(e);
      if (e instanceof Error && e.name == 'TimeoutError') {
        const client = this.getClient(session) as any;
        client.status = 'CLOSED';
      }
    }
  }

  async opendata(req: Request, session: string, res?: any) {
    await this.createSessionUtil(req, clientsArray, session, res);
  }

  exportPhoneCode(
    req: any,
    phone: any,
    phoneCode: any,
    client: WhatsAppServer,
    res?: any
  ) {
    eventEmitter.emit(`phoneCode-${client.session}`, phoneCode, client);

    Object.assign(client, {
      status: 'PHONECODE',
      phoneCode: phoneCode,
      phone: phone,
    });

    req.io.emit('phoneCode', {
      data: phoneCode,
      phone: phone,
      session: client.session,
    });

    callWebHook(client, req, 'phoneCode', {
      phoneCode: phoneCode,
      phone: phone,
      session: client.session,
    });

    if (res && !res._headerSent)
      res.status(200).json({
        status: 'phoneCode',
        phone: phone,
        phoneCode: phoneCode,
        session: client.session,
      });
  }

  exportQR(
    req: any,
    qrCode: any,
    urlCode: any,
    client: WhatsAppServer,
    res?: any
  ) {
    eventEmitter.emit(`qrcode-${client.session}`, qrCode, urlCode, client);
    Object.assign(client, {
      status: 'QRCODE',
      qrcode: qrCode,
      urlcode: urlCode,
    });

    qrCode = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(qrCode, 'base64');

    req.io.emit('qrCode', {
      data: 'data:image/png;base64,' + imageBuffer.toString('base64'),
      session: client.session,
    });

    callWebHook(client, req, 'qrcode', {
      qrcode: qrCode,
      urlcode: urlCode,
      session: client.session,
    });
    if (res && !res._headerSent)
      res.status(200).json({
        status: 'qrcode',
        qrcode: qrCode,
        urlcode: urlCode,
        session: client.session,
      });
  }

  async onParticipantsChanged(req: any, client: any) {
    await client.isConnected();
    await client.onParticipantsChanged((message: any) => {
      callWebHook(client, req, 'onparticipantschanged', message);
    });
  }

  async start(req: Request, client: WhatsAppServer) {
    try {
      await client.isConnected();
      Object.assign(client, { status: 'CONNECTED', qrcode: null });

      req.logger.info(`Started Session: ${client.session}`);
      //callWebHook(client, req, 'session-logged', { status: 'CONNECTED'});
      req.io.emit('session-logged', { status: true, session: client.session });
      startHelper(client, req);
    } catch (error) {
      req.logger.error(error);
      req.io.emit('session-error', client.session);
    }

    await this.checkStateSession(client, req);
    await this.listenMessages(client, req);

    if (req.serverOptions.webhook.listenAcks) {
      await this.listenAcks(client, req);
    }

    if (req.serverOptions.webhook.onPresenceChanged) {
      await this.onPresenceChanged(client, req);
    }
  }

  async checkStateSession(client: WhatsAppServer, req: Request) {
    await client.onStateChange((state) => {
      req.logger.info(`State Change ${state}: ${client.session}`);
      const conflits = [SocketState.CONFLICT];

      if (conflits.includes(state)) {
        client.useHere();
      }
    });
  }

  async listenMessages(client: WhatsAppServer, req: Request) {
    await client.onMessage(async (message: any) => {
      eventEmitter.emit(`mensagem-${client.session}`, client, message);
      callWebHook(client, req, 'onmessage', message);
      if (message.type === 'location')
        client.onLiveLocation(message.sender.id, (location) => {
          callWebHook(client, req, 'location', location);
        });
    });

    await client.onAnyMessage(async (message: any) => {
      message.session = client.session;

      if (message.type === 'sticker') {
        download(message, client, req.logger);
      }

      if (
        req.serverOptions?.websocket?.autoDownload ||
        (req.serverOptions?.webhook?.autoDownload && message.fromMe == false)
      ) {
        await autoDownload(client, req, message);
      }

      req.io.emit('received-message', { response: message });
      if (req.serverOptions.webhook.onSelfMessage && message.fromMe)
        callWebHook(client, req, 'onselfmessage', message);
    });

    await client.onIncomingCall(async (call) => {
      req.io.emit('incomingcall', call);
      callWebHook(client, req, 'incomingcall', call);
    });
  }

  async listenAcks(client: WhatsAppServer, req: Request) {
    await client.onAck(async (ack) => {
      req.io.emit('onack', ack);
      callWebHook(client, req, 'onack', ack);
    });
  }

  async onPresenceChanged(client: WhatsAppServer, req: Request) {
    await client.onPresenceChanged(async (presenceChangedEvent) => {
      req.io.emit('onpresencechanged', presenceChangedEvent);
      callWebHook(client, req, 'onpresencechanged', presenceChangedEvent);
    });
  }

  async onReactionMessage(client: WhatsAppServer, req: Request) {
    await client.isConnected();
    await client.onReactionMessage(async (reaction: any) => {
      req.io.emit('onreactionmessage', reaction);
      callWebHook(client, req, 'onreactionmessage', reaction);
    });
  }

  async onRevokedMessage(client: WhatsAppServer, req: Request) {
    await client.isConnected();
    await client.onRevokedMessage(async (response: any) => {
      req.io.emit('onrevokedmessage', response);
      callWebHook(client, req, 'onrevokedmessage', response);
    });
  }
  async onPollResponse(client: WhatsAppServer, req: Request) {
    await client.isConnected();
    await client.onPollResponse(async (response: any) => {
      req.io.emit('onpollresponse', response);
      callWebHook(client, req, 'onpollresponse', response);
    });
  }
  async onLabelUpdated(client: WhatsAppServer, req: Request) {
    await client.isConnected();
    await client.onUpdateLabel(async (response: any) => {
      req.io.emit('onupdatelabel', response);
      callWebHook(client, req, 'onupdatelabel', response);
    });
  }

  encodeFunction(data: any, webhook: any) {
    data.webhook = webhook;
    return JSON.stringify(data);
  }

  decodeFunction(text: any, client: any) {
    const object = JSON.parse(text);
    if (object.webhook && !client.webhook) client.webhook = object.webhook;
    delete object.webhook;
    return object;
  }

  getClient(session: any) {
    let client = clientsArray[session];

    if (!client)
      client = clientsArray[session] = {
        status: null,
        session: session,
      } as any;
    return client;
  }
}

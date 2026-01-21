/*
 * Copyright 2023 WPPConnect Team
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
import {
  CreateBucketCommand,
  PutObjectCommand,
  PutPublicAccessBlockCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import api from 'axios';
import Crypto from 'crypto';
import { Request } from 'express';
import fs from 'fs';
import mimetypes from 'mime-types';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

import config from '../config';
import { convert } from '../mapper/index';
import { ServerOptions } from '../types/ServerOptions';
import { bucketAlreadyExists } from './bucketAlreadyExists';

let mime: any, crypto: any; //, aws: any;
if (config.webhook.uploadS3) {
  mime = config.webhook.uploadS3 ? mimetypes : null;
  crypto = config.webhook.uploadS3 ? Crypto : null;
}
if (config?.websocket?.uploadS3) {
  mime = config.websocket.uploadS3 ? mimetypes : null;
  crypto = config.websocket.uploadS3 ? Crypto : null;
}

export function contactToArray(
  number: any,
  isGroup?: boolean,
  isNewsletter?: boolean,
  isLid?: boolean
) {
  const localArr: any = [];
  if (Array.isArray(number)) {
    for (let contact of number) {
      isGroup || isNewsletter
        ? (contact = contact.split('@')[0])
        : (contact = contact.split('@')[0]?.replace(/[^\w ]/g, ''));
      if (contact !== '')
        if (isGroup) (localArr as any).push(`${contact}@g.us`);
        else if (isNewsletter) (localArr as any).push(`${contact}@newsletter`);
        else if (isLid || contact.length > 14)
          (localArr as any).push(`${contact}@lid`);
        else (localArr as any).push(`${contact}@c.us`);
    }
  } else {
    const arrContacts = number.split(/\s*[,;]\s*/g);
    for (let contact of arrContacts) {
      isGroup || isNewsletter
        ? (contact = contact.split('@')[0])
        : (contact = contact.split('@')[0]?.replace(/[^\w ]/g, ''));
      if (contact !== '')
        if (isGroup) (localArr as any).push(`${contact}@g.us`);
        else if (isNewsletter) (localArr as any).push(`${contact}@newsletter`);
        else if (isLid || contact.length > 14)
          (localArr as any).push(`${contact}@lid`);
        else (localArr as any).push(`${contact}@c.us`);
    }
  }

  return localArr;
}

export function groupToArray(group: any) {
  const localArr: any = [];
  if (Array.isArray(group)) {
    for (let contact of group) {
      contact = contact.split('@')[0];
      if (contact !== '') (localArr as any).push(`${contact}@g.us`);
    }
  } else {
    const arrContacts = group.split(/\s*[,;]\s*/g);
    for (let contact of arrContacts) {
      contact = contact.split('@')[0];
      if (contact !== '') (localArr as any).push(`${contact}@g.us`);
    }
  }

  return localArr;
}

export function groupNameToArray(group: any) {
  const localArr: any = [];
  if (Array.isArray(group)) {
    for (const contact of group) {
      if (contact !== '') (localArr as any).push(`${contact}`);
    }
  } else {
    const arrContacts = group.split(/\s*[,;]\s*/g);
    for (const contact of arrContacts) {
      if (contact !== '') (localArr as any).push(`${contact}`);
    }
  }

  return localArr;
}

export async function callWebHook(
  client: any,
  req: Request,
  event: any,
  data: any
) {
  // Check if req and serverOptions are available
  if (!req || !req.serverOptions) {
    logger?.warn('[Webhook] Request or serverOptions not available', {
      hasReq: !!req,
      hasServerOptions: !!(req && req.serverOptions),
      event,
      session: client?.session,
    });
    return;
  }

  const webhook =
    client?.config?.webhook || req.serverOptions.webhook?.url || false;

  if (!webhook) {
    req.logger?.debug('[Webhook] No webhook configured', {
      clientWebhook: client?.config?.webhook,
      serverWebhook: req.serverOptions.webhook?.url,
      event,
      session: client?.session,
    });
    return;
  }

  req.logger?.debug('[Webhook] Attempting to send webhook', {
    webhook,
    event,
    session: client?.session,
    from: data?.from,
    chatId: data?.chatId,
  });

  // Filter 1: NEVER send group messages to webhook (highest priority)
  const isGroup =
    data?.from?.endsWith('@g.us') || data?.chatId?.endsWith('@g.us');
  if (isGroup) {
    req.logger.debug('Blocking group message from webhook', {
      event,
      from: data?.from,
      chatId: data?.chatId,
      fromMe: data?.fromMe,
    });
    return;
  }

  // Filter 1.5: NEVER send newsletter/channel messages to webhook
  const isNewsletter =
    data?.from?.endsWith('@newsletter') ||
    data?.chatId?.endsWith('@newsletter');
  if (isNewsletter) {
    req.logger.debug('Blocking newsletter/channel message from webhook', {
      event,
      from: data?.from,
      chatId: data?.chatId,
      fromMe: data?.fromMe,
    });
    return;
  }

  // Filter 2: Check if it's an API-sent message
  // API messages have ack=0 (not sent to server yet)
  // App/Web messages have ack=1 (already sent to server)
  // const isApiMessage = data?.ack === 0;
  // const shouldFilterApiMessage =
  //   !req.serverOptions.webhook.sendApi &&
  //   data?.fromMe &&
  //   isApiMessage;

  // if (shouldFilterApiMessage) {
  //   req.logger.debug('Filtering API-sent message from webhook', {
  //     sendApi: req.serverOptions.webhook.sendApi,
  //     fromMe: data?.fromMe,
  //     messageId: data?.id?.id,
  //     event: event
  //   });
  //   return;
  // }

  // Filter 3: Check ignore list (for other patterns like status@broadcast)
  if (req.serverOptions.webhook?.ignore) {
    const shouldIgnore = req.serverOptions.webhook.ignore.some(
      (pattern: string) => {
        return (
          event === pattern ||
          data?.type === pattern ||
          data?.from === pattern ||
          data?.from?.endsWith(pattern) ||
          data?.chatId?.endsWith(pattern)
        );
      }
    );
    if (shouldIgnore) {
      req.logger.debug('Ignoring webhook due to ignore pattern', {
        event,
        from: data?.from,
        chatId: data?.chatId,
        type: data?.type,
      });
      return;
    }
  }
  if (req.serverOptions.webhook.autoDownload)
    await autoDownload(client, req, data);
  try {
    const chatId =
      data.from ||
      data.chatId ||
      (data.chatId ? data.chatId._serialized : null);

    // Add event and session to webhook data
    const webhookData: any = {
      event: event,
      session: client.session,
    };

    data = Object.assign(webhookData, data);
    if (req.serverOptions.mapper.enable)
      data = await convert(req.serverOptions.mapper.prefix, data);

    const headers: any = {};
    if (req.serverOptions.webhook.globalXToken) {
      headers['x-token'] = req.serverOptions.webhook.globalXToken;
      req.logger.info(
        `[Webhook] Adding x-token header: ${req.serverOptions.webhook.globalXToken.substring(
          0,
          10
        )}...`
      );
    } else {
      req.logger.warn(`[Webhook] No globalXToken found in server options`);
    }

    req.logger.info(
      `[Webhook] Sending ${event} to ${webhook} with headers:`,
      Object.keys(headers)
    );

    api
      .post(webhook, data, {
        headers,
        timeout: 30000, // 30 seconds timeout
      })
      .then((response) => {
        req.logger.info(`[Webhook] Successfully sent ${event} to ${webhook}`, {
          status: response.status,
          event,
          session: client?.session,
        });
        try {
          const events = ['unreadmessages', 'onmessage'];
          if (events.includes(event) && req.serverOptions.webhook.readMessage)
            client.sendSeen(chatId);
        } catch (e) {
          req.logger.warn(`[Webhook] Error sending seen after webhook:`, e);
        }
      })
      .catch((e) => {
        req.logger.error(`[Webhook] Error calling webhook ${webhook}:`, {
          event,
          session: client?.session,
          error: e.message || e,
          code: e.code,
          response: e.response?.data,
          status: e.response?.status,
        });
      });
  } catch (e) {
    req.logger.error(e);
  }
}

export async function autoDownload(client: any, req: any, message: any) {
  try {
    if (message && (message['mimetype'] || message.isMedia || message.isMMS)) {
      const buffer = await client.decryptFile(message);
      if (
        req.serverOptions.webhook.uploadS3 ||
        req.serverOptions?.websocket?.uploadS3
      ) {
        const hashName = crypto.randomBytes(24).toString('hex');

        if (
          !config?.aws_s3?.region ||
          !config?.aws_s3?.access_key_id ||
          !config?.aws_s3?.secret_key
        )
          throw new Error('Please, configure your aws configs');
        const s3Client = new S3Client({
          region: config?.aws_s3?.region,
          endpoint: config?.aws_s3?.endpoint || undefined,
          forcePathStyle: config?.aws_s3?.forcePathStyle || undefined,
        });
        let bucketName = config?.aws_s3?.defaultBucketName
          ? config?.aws_s3?.defaultBucketName
          : client.session;
        bucketName = bucketName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]|[— _.,?!]/g, '')
          .toLowerCase();
        bucketName =
          bucketName.length < 3
            ? bucketName +
              `${Math.floor(Math.random() * (999 - 100 + 1)) + 100}`
            : bucketName;
        const fileName = `${
          config.aws_s3.defaultBucketName ? client.session + '/' : ''
        }${hashName}.${mime.extension(message.mimetype)}`;

        if (
          !config.aws_s3.defaultBucketName &&
          !(await bucketAlreadyExists(bucketName))
        ) {
          await s3Client.send(
            new CreateBucketCommand({
              Bucket: bucketName,
              ObjectOwnership: 'ObjectWriter',
            })
          );
          await s3Client.send(
            new PutPublicAccessBlockCommand({
              Bucket: bucketName,
              PublicAccessBlockConfiguration: {
                BlockPublicAcls: false,
                IgnorePublicAcls: false,
                BlockPublicPolicy: false,
              },
            })
          );
        }

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: message.mimetype,
            ACL: 'public-read',
          })
        );

        message.fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
      } else {
        message.body = await buffer.toString('base64');
      }
    }
  } catch (e) {
    req.logger.error(e);
  }
}

export async function startAllSessions(config: any, logger: any) {
  try {
    await api.post(
      `${config.host}:${config.port}/api/${config.secretKey}/start-all`
    );
  } catch (e) {
    logger.error(e);
  }
}

export async function startHelper(client: any, req: any) {
  if (req.serverOptions.webhook.allUnreadOnStart) await sendUnread(client, req);

  if (req.serverOptions.archive.enable) await archive(client, req);
}

async function sendUnread(client: any, req: any) {
  req.logger.info(`${client.session} : Inicio enviar mensagens não lidas`);

  try {
    const chats = await client.getAllChatsWithMessages(true);

    if (chats && chats.length > 0) {
      for (let i = 0; i < chats.length; i++)
        for (let j = 0; j < chats[i].msgs.length; j++) {
          callWebHook(client, req, 'unreadmessages', chats[i].msgs[j]);
        }
    }

    req.logger.info(`${client.session} : Fim enviar mensagens não lidas`);
  } catch (ex) {
    req.logger.error(ex);
  }
}

async function archive(client: any, req: any) {
  async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time * 10));
  }

  req.logger.info(`${client.session} : Inicio arquivando chats`);

  try {
    let chats = await client.getAllChats();
    if (chats && Array.isArray(chats) && chats.length > 0) {
      chats = chats.filter((c) => !c.archive);
    }
    if (chats && Array.isArray(chats) && chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        const date = new Date(chats[i].t * 1000);

        if (DaysBetween(date) > req.serverOptions.archive.daysToArchive) {
          await client.archiveChat(
            chats[i].id.id || chats[i].id._serialized,
            true
          );
          await sleep(
            Math.floor(Math.random() * req.serverOptions.archive.waitTime + 1)
          );
        }
      }
    }
    req.logger.info(`${client.session} : Fim arquivando chats`);
  } catch (ex) {
    req.logger.error(ex);
  }
}

function DaysBetween(StartDate: Date) {
  const endDate = new Date();
  // The number of milliseconds in all UTC days (no DST)
  const oneDay = 1000 * 60 * 60 * 24;

  // A day in UTC always lasts 24 hours (unlike in other time formats)
  const start = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  const end = Date.UTC(
    StartDate.getFullYear(),
    StartDate.getMonth(),
    StartDate.getDate()
  );

  // so it's safe to divide by 24 hours
  return (start - end) / oneDay;
}

export function createFolders() {
  const __dirname = path.resolve(path.dirname(''));
  const dirFiles = path.resolve(__dirname, 'WhatsAppImages');
  if (!fs.existsSync(dirFiles)) {
    fs.mkdirSync(dirFiles);
  }

  const dirUpload = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(dirUpload)) {
    fs.mkdirSync(dirUpload);
  }
}

export function strToBool(s: string) {
  return /^(true|1)$/i.test(s);
}

export function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface: any = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      )
        return alias.address;
    }
  }
  return '0.0.0.0';
}

export function setMaxListners(serverOptions: ServerOptions) {
  if (serverOptions && Number.isInteger(serverOptions.maxListeners)) {
    process.setMaxListeners(serverOptions.maxListeners);
  }
}

export const unlinkAsync = promisify(fs.unlink);

export function createCatalogLink(session: any) {
  const [wid] = session.split('@');
  return `https://wa.me/c/${wid}`;
}

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

import { Request, Response } from 'express';
import fs from 'fs';

import { logger } from '..';
import config from '../config';
import { backupSessions, restoreSessions } from '../util/manageSession';
import { clientsArray } from '../util/sessionUtil';

export async function backupAllSessions(req: Request, res: Response) {
  /**
     * #swagger.tags = ["Misc"]
     * #swagger.description = 'Please, open the router in your browser, in swagger this not run'
     * #swagger.produces = ['application/octet-stream']
     * #swagger.consumes = ['application/octet-stream']
       #swagger.autoBody=false
       #swagger.parameters["secretkey"] = {
          required: true,
          schema: 'THISISMYSECURETOKEN'
       }
       #swagger.responses[200] = {
        description: 'A ZIP file contaings your backup. Please, open this link in your browser',
        content: {
          "application/zip": {
            schema: {}
          }
        },
      }
     */
  const { secretkey } = req.params;

  if (secretkey !== config.secretKey) {
    res.status(400).json({
      response: 'error',
      message: 'The token is incorrect',
    });
  }

  try {
    res.setHeader('Content-Type', 'application/zip');
    res.send(await backupSessions(req));
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error on backup session',
      error: error,
    });
  }
}

export async function restoreAllSessions(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
    #swagger.parameters["secretkey"] = {
    required: true,
    schema: 'THISISMYSECURETOKEN'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: "string",
                format: "binary"
              }
            },
            required: ['file'],
          }
        }
      }
    }
  */
  const { secretkey } = req.params;

  if (secretkey !== config.secretKey) {
    res.status(400).json({
      response: 'error',
      message: 'The token is incorrect',
    });
  }

  try {
    const result = await restoreSessions(req, req.file as any);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error on restore session',
      error: error,
    });
  }
}

export async function takeScreenshot(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
    #swagger.security = [{
          "bearerAuth": []
    }]
    #swagger.parameters["session"] = {
    schema: 'NERDWHATS_AMERICA'
    }
  */

  try {
    const result = await req.client.takeScreenshot();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error on take screenshot',
      error: error,
    });
  }
}

export async function clearSessionData(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
    #swagger.parameters["secretkey"] = {
    required: true,
    schema: 'THISISMYSECURETOKEN'
    }
    #swagger.parameters["session"] = {
    schema: 'NERDWHATS_AMERICA'
    }
  */

  try {
    const { secretkey, session } = req.params;

    if (secretkey !== config.secretKey) {
      res.status(400).json({
        response: 'error',
        message: 'The token is incorrect',
      });
    }
    if (req?.client?.page) {
      delete clientsArray[req.params.session];
      await req.client.logout();
    }
    const path = config.customUserDataDir + session;
    const pathToken = __dirname + `../../../tokens/${session}.data.json`;
    if (fs.existsSync(path)) {
      await fs.promises.rm(path, {
        recursive: true,
      });
    }
    if (fs.existsSync(pathToken)) {
      await fs.promises.rm(pathToken);
    }
    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      status: false,
      message: 'Error on clear session data',
      error: error,
    });
  }
}

export async function setLimit(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.description = 'Change limits of whatsapp web. Types value: maxMediaSize, maxFileSize, maxShare, statusVideoMaxDuration, unlimitedPin;'
   #swagger.autoBody=false
    #swagger.security = [{
          "bearerAuth": []
    }]
    #swagger.parameters["session"] = {
    schema: 'NERDWHATS_AMERICA'
    }
     #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              value: { type: 'any' },
            },
            required: ['type', 'value'],
          },
          examples: {
            'Default': {
              value: {
                type: 'maxFileSize',
                value: 104857600
              },
            },
          },
        },
      },
    }
  */

  try {
    const { type, value } = req.body;
    if (!type || !value) throw new Error('Send de type and value');

    const result = await req.client.setLimit(type, value);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error on set limit',
      error: error,
    });
  }
}

export async function extractLidMapping(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.description = 'Extract LID mapping and all contact information from WhatsApp Web Store'
   #swagger.autoBody=false
    #swagger.security = [{
          "bearerAuth": []
    }]
    #swagger.parameters["session"] = {
    schema: 'NERDWHATS_AMERICA'
    }
    #swagger.responses[200] = {
      description: 'Successfully extracted contact information',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'success' },
              response: {
                type: 'object',
                properties: {
                  total: { type: 'number', example: 150 },
                  lids: { type: 'number', example: 25 },
                  phones: { type: 'number', example: 125 },
                  contacts: {
                    type: 'array',
                    items: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    }
  */

  try {
    const client = req.client;

    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found',
      });
    }

    // Verifica se está conectado
    if (!client.status || client.status !== 'CONNECTED') {
      return res.status(400).json({
        status: 'error',
        message: 'Session is not connected',
      });
    }

    // Verifica se page está disponível
    const page = (client as any).page;
    if (!page) {
      return res.status(400).json({
        status: 'error',
        message: 'Client page is not available',
      });
    }

    // Adiciona timeout de 45 segundos para extrair todos os campos
    const data = await Promise.race([
      page.evaluate(() => {
        try {
          const contacts = (window as any).Store.Contact.getModelsArray();
          const seen = new WeakSet(); // Para evitar referências circulares
          const seenIds = new Set(); // Para rastrear IDs já processados

          const serializeValue = (val: any, depth = 0, maxDepth = 5): any => {
            // Limita profundidade de recursão
            if (depth > maxDepth) return '[Max Depth]';

            // Valores primitivos
            if (val === null || val === undefined) return null;
            if (typeof val !== 'object') return val;
            if (val instanceof Date) return val.toISOString();

            // Evita referências circulares usando WeakSet
            if (seen.has(val)) return '[Circular]';
            seen.add(val);

            try {
              // Se tem _serialized, usa isso (mais seguro)
              if (val._serialized) {
                return val._serialized;
              }

              // Arrays - limita para evitar loops
              if (Array.isArray(val)) {
                if (depth >= maxDepth - 1) return `[Array: ${val.length} items]`;
                return val.slice(0, 200).map((item) => serializeValue(item, depth + 1, maxDepth));
              }

              // Objetos - extrai propriedades com limites
              const result: any = {};

              // Limita número de propriedades para evitar loops
              const maxProps = depth === 0 ? 100 : depth === 1 ? 50 : 20;

              // Usa Object.getOwnPropertyNames para pegar propriedades
              const allPropertyNames = Object.getOwnPropertyNames(val);
              const allKeys = Object.keys(val);
              const allProps = [...new Set([...allKeys, ...allPropertyNames])].slice(0, maxProps);

              let propCount = 0;
              for (const key of allProps) {
                if (propCount >= maxProps) break;

                try {
                  // Tenta acessar a propriedade
                  const propVal = val[key];

                  // Ignora funções e símbolos
                  if (typeof propVal === 'function' || typeof propVal === 'symbol') {
                    continue;
                  }

                  // Para objetos muito profundos, apenas marca o tipo
                  if (depth >= maxDepth - 1 && typeof propVal === 'object' && propVal !== null) {
                    result[key] = `[Object: ${propVal.constructor?.name || 'Object'}]`;
                    propCount++;
                    continue;
                  }

                  // Tenta serializar o valor
                  result[key] = serializeValue(propVal, depth + 1, maxDepth);
                  propCount++;
                } catch (e) {
                  // Se não conseguir acessar, tenta com getOwnPropertyDescriptor (apenas para propriedades simples)
                  if (depth < 2) {
                    try {
                      const descriptor = Object.getOwnPropertyDescriptor(val, key);
                      if (descriptor && descriptor.value !== undefined) {
                        if (typeof descriptor.value !== 'function' && typeof descriptor.value !== 'symbol') {
                          if (typeof descriptor.value === 'object' && depth >= maxDepth - 1) {
                            result[key] = '[Object]';
                          } else {
                            result[key] = serializeValue(descriptor.value, depth + 1, maxDepth);
                          }
                          propCount++;
                        }
                      }
                    } catch (e2) {
                      // Ignora propriedades que não podem ser acessadas
                    }
                  }
                }
              }

              seen.delete(val);
              return result;
            } catch (e) {
              seen.delete(val);
              return String(val);
            }
          };

          return contacts.map((contact: any) => {
            // Começa com campos básicos
            const result: any = {
              id: contact.id?._serialized || contact.id || null,
              server: contact.id?.server || null,
              user: contact.id?.user || null,
            };

            // Extrai propriedades do contato com limites
            try {
              // Usa Object.getOwnPropertyNames para pegar todas as propriedades
              const allPropertyNames = Object.getOwnPropertyNames(contact);
              const allKeys = Object.keys(contact);
              const allProps = [...new Set([...allKeys, ...allPropertyNames])];

              let propCount = 0;
              const maxProps = 150; // Limite máximo de propriedades por contato

              for (const key of allProps) {
                if (propCount >= maxProps) break;

                // Pula propriedades já adicionadas
                if (result[key] !== undefined) continue;

                try {
                  const val = contact[key];

                  // Ignora funções e símbolos
                  if (typeof val === 'function' || typeof val === 'symbol') {
                    continue;
                  }

                  // Serializa o valor com profundidade limitada
                  result[key] = serializeValue(val, 0, 5);
                  propCount++;
                } catch (e) {
                  // Se não conseguir acessar diretamente, tenta com descriptor (apenas para propriedades simples)
                  try {
                    const descriptor = Object.getOwnPropertyDescriptor(contact, key);
                    if (descriptor && descriptor.value !== undefined) {
                      if (typeof descriptor.value !== 'function' && typeof descriptor.value !== 'symbol') {
                        result[key] = serializeValue(descriptor.value, 0, 5);
                        propCount++;
                      }
                    } else if (descriptor && descriptor.get) {
                      // Tenta chamar getter apenas uma vez e com cuidado
                      try {
                        const getterValue = descriptor.get.call(contact);
                        if (getterValue !== undefined && typeof getterValue !== 'function' && typeof getterValue !== 'symbol') {
                          result[key] = serializeValue(getterValue, 0, 3); // Limita profundidade para getters
                          propCount++;
                        }
                      } catch (e3) {
                        // Ignora se getter falhar
                      }
                    }
                  } catch (e2) {
                    // Ignora propriedades que não podem ser acessadas
                  }
                }
              }
            } catch (e) {
              // Ignora erros ao acessar propriedades
            }

            return result;
          });
        } catch (error) {
          throw new Error(`Error extracting contacts: ${error}`);
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Operation took too long')), 45000)
      ),
    ]);

    const lids = data.filter((c: any) => c.server === 'lid').length;
    const phones = data.filter((c: any) => c.server === 'c.us').length;

    res.status(200).json({
      status: 'success',
      response: {
        total: data.length,
        lids: lids,
        phones: phones,
        contacts: data,
      },
    });
  } catch (error: any) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error extracting LID mapping',
      error: error?.message || error,
    });
  }
}

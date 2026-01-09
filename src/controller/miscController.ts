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
import Factory from '../util/tokenStore/factory';
import config from '../config';
import { backupSessions, restoreSessions } from '../util/manageSession';
import { clientsArray, deleteSessionOnArray } from '../util/sessionUtil';
import { callWebHook } from '../util/functions';

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
      return res.status(400).json({
        response: 'error',
        message: 'The token is incorrect',
      });
    }

    // Logout and remove from clientsArray
    if (req?.client?.page) {
      delete clientsArray[req.params.session];
      await req.client.logout();
    }

    // Remove user data directory
    const path = config.customUserDataDir + session;
    if (fs.existsSync(path)) {
      await fs.promises.rm(path, {
        recursive: true,
      });
      logger.info(`Removed user data directory for session: ${session}`);
    }

    // Remove token using TokenStore (works for all storage types: file, mongodb, redis)
    try {
      const tokenStore = new Factory();
      const myTokenStore = tokenStore.createTokenStory({ session } as any);
      await myTokenStore.removeToken(session);
      logger.info(`Removed token for session: ${session}`);
    } catch (tokenError) {
      logger.warn(`Could not remove token for session ${session}:`, tokenError);
    }

    res.status(200).json({
      success: true,
      message: `Session ${session} data cleared successfully`
    });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      status: false,
      message: 'Error on clear session data',
      error: error,
    });
  }
}

export async function deleteSession(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.description = 'Delete session completely: closes connection, removes from memory, deletes user data directory and tokens'
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
      return res.status(400).json({
        response: 'error',
        message: 'The token is incorrect',
      });
    }

    const client = clientsArray[session];
    let wasConnected = false;

    // Step 1: Close session if it's open
    if (client) {
      try {
        wasConnected = client.status !== null;
        
        // Close browser/page if exists
        if (client.page) {
          try {
            await client.close();
            logger.info(`Closed browser for session: ${session}`);
          } catch (closeError) {
            logger.warn(`Error closing browser for session ${session}:`, closeError);
            // Try to close browser directly
            try {
              if (client.page?.browser) {
                await client.page.browser().close();
              }
            } catch (browserError) {
              logger.warn(`Error closing browser directly:`, browserError);
            }
          }
        }

        // Logout if connected
        if (wasConnected && client.logout) {
          try {
            await client.logout();
            logger.info(`Logged out session: ${session}`);
          } catch (logoutError) {
            logger.warn(`Error logging out session ${session}:`, logoutError);
          }
        }

        // Emit socket event
        if (req.io) {
          req.io.emit('whatsapp-status', false);
        }

        // Call webhook if client exists
        if (wasConnected) {
          try {
            callWebHook(client, req, 'deletesession', {
              message: `Session: ${session} deleted`,
              connected: false,
            });
          } catch (webhookError) {
            logger.warn(`Error calling webhook for session deletion:`, webhookError);
          }
        }
      } catch (clientError) {
        logger.warn(`Error processing client for session ${session}:`, clientError);
      }
    }

    // Step 2: Remove from clientsArray
    try {
      deleteSessionOnArray(session);
      delete clientsArray[session];
      logger.info(`Removed session ${session} from clientsArray`);
    } catch (arrayError) {
      logger.warn(`Error removing session from array:`, arrayError);
    }

    // Step 3: Remove user data directory
    const userDataPath = config.customUserDataDir + session;
    if (fs.existsSync(userDataPath)) {
      try {
        await fs.promises.rm(userDataPath, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 1000,
        });
        logger.info(`Removed user data directory for session: ${session}`);
      } catch (dirError) {
        logger.error(`Error removing user data directory for session ${session}:`, dirError);
      }
    }

    // Step 4: Remove token using TokenStore (works for all storage types: file, mongodb, redis)
    try {
      const tokenStore = new Factory();
      const myTokenStore = tokenStore.createTokenStory({ session } as any);
      await myTokenStore.removeToken(session);
      logger.info(`Removed token for session: ${session}`);
    } catch (tokenError) {
      logger.warn(`Could not remove token for session ${session}:`, tokenError);
    }

    return res.status(200).json({
      success: true,
      message: `Session ${session} deleted successfully`,
      wasConnected: wasConnected,
    });
  } catch (error: any) {
    logger.error(`Error deleting session:`, error);
    return res.status(500).json({
      status: false,
      message: 'Error on delete session',
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

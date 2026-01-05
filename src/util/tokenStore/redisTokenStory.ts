import config from '../../config';
import redisClient from '../db/redis/db';
import { getIPAddress } from '../functions';

class RedisTokenStore {
  declare client: any;
  declare prefix: string;
  constructor(client: any) {
    this.client = client;

    let prefix = config.db.redisPrefix || '';
    if (prefix === 'docker') {
      prefix = getIPAddress();
    }
  }
  tokenStore = {
    getToken: (sessionName: string) =>
      new Promise(async (resolve, reject) => {
        try {
          const reply = await (redisClient as any).get(this.prefix + sessionName);
          if (!reply) return resolve(null);
          
          let object;
          if (this.client.decodeFunction) {
            try {
              object = this.client.decodeFunction(reply, this.client);
            } catch(e) {
               object = JSON.parse(reply);
            }
          } else {
            object = JSON.parse(reply);
          }
          
          if (object) {
            if (object.config && Object.keys(this.client.config).length === 0)
              this.client.config = object.config;
            if (
              object.webhook &&
              Object.keys(this.client.config).length === 0
            )
              this.client.config.webhook = object.webhook;
          }
          resolve(object);
        } catch (err) {
          reject(err);
        }
      }),
    setToken: (sessionName: string, tokenData: any) =>
      new Promise(async (resolve) => {
        try {
          tokenData.sessionName = sessionName;
          tokenData.config = this.client.config;
          
          let text;
           if (this.client.encodeFunction) {
             text = this.client.encodeFunction(tokenData, this.client.config.webhook, this.client.token);
           } else {
             text = JSON.stringify(tokenData);
           }

          await (redisClient as any).set(
            this.prefix + sessionName,
            text
          );
          resolve(true);
        } catch (err) {
          resolve(false);
        }
      }),
    removeToken: (sessionName: string) =>
      new Promise(async (resolve) => {
        try {
          await (redisClient as any).del(this.prefix + sessionName);
          resolve(true);
        } catch (err) {
          resolve(false);
        }
      }),
    listTokens: () =>
      new Promise(async (resolve) => {
        try {
          const keys = await (redisClient as any).keys(this.prefix + '*');
          if (!keys) return resolve([]);
          
          const processedKeys = keys.map((item: any) => {
            if (this.prefix !== '' && item.includes(this.prefix)) {
              return item.substring(
                item.indexOf(this.prefix) + this.prefix.length
              );
            }
            return item;
          });
          resolve(processedKeys);
        } catch (err) {
          resolve([]);
        }
      }),
  };
}

export default RedisTokenStore;

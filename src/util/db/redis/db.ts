import config from '../../../config';

const redis = config.tokenStoreType === 'redis' ? require('redis') : null;

let RedisClient: any = null;

if (config.tokenStoreType === 'redis') {
  RedisClient = redis.createClient({
    socket: {
      host: config.db.redisHost,
      port: config.db.redisPort,
    },
    password: config.db.redisPassword,
    database: config.db.redisDb,
  });
  RedisClient.connect().catch((err: any) => {
    console.error('Redis connection error:', err);
  });
}

export default RedisClient;

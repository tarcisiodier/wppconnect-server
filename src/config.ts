import { ServerOptions } from './types/ServerOptions';

export default {
  secretKey: process.env.SECRET_KEY || 'THISISMYSECURETOKEN',
  host: process.env.HOST || 'http://localhost',
  port: process.env.PORT || '21465',
  deviceName: process.env.DEVICE_NAME || 'WppConnect',
  poweredBy: process.env.POWERED_BY || 'WPPConnect-Server',
  startAllSession: process.env.START_ALL_SESSION ? process.env.START_ALL_SESSION === 'true' : true,
  tokenStoreType: process.env.TOKEN_STORE_TYPE || 'file',
  maxListeners: process.env.MAX_LISTENERS ? parseInt(process.env.MAX_LISTENERS) : 15,
  customUserDataDir: process.env.CUSTOM_USER_DATA_DIR || './userDataDir/',
  webhook: {
    url: process.env.WEBHOOK_URL || null,
    autoDownload: process.env.WEBHOOK_AUTO_DOWNLOAD ? process.env.WEBHOOK_AUTO_DOWNLOAD === 'true' : true,
    uploadS3: process.env.WEBHOOK_UPLOAD_S3 ? process.env.WEBHOOK_UPLOAD_S3 === 'true' : false,
    readMessage: process.env.WEBHOOK_READ_MESSAGE ? process.env.WEBHOOK_READ_MESSAGE === 'true' : true,
    allUnreadOnStart: process.env.WEBHOOK_ALL_UNREAD_ON_START ? process.env.WEBHOOK_ALL_UNREAD_ON_START === 'true' : false,
    listenAcks: process.env.WEBHOOK_LISTEN_ACKS ? process.env.WEBHOOK_LISTEN_ACKS === 'true' : true,
    onPresenceChanged: process.env.WEBHOOK_ON_PRESENCE_CHANGED ? process.env.WEBHOOK_ON_PRESENCE_CHANGED === 'true' : true,
    onParticipantsChanged: process.env.WEBHOOK_ON_PARTICIPANTS_CHANGED ? process.env.WEBHOOK_ON_PARTICIPANTS_CHANGED === 'true' : true,
    onReactionMessage: process.env.WEBHOOK_ON_REACTION_MESSAGE ? process.env.WEBHOOK_ON_REACTION_MESSAGE === 'true' : true,
    onPollResponse: process.env.WEBHOOK_ON_POLL_RESPONSE ? process.env.WEBHOOK_ON_POLL_RESPONSE === 'true' : true,
    onRevokedMessage: process.env.WEBHOOK_ON_REVOKED_MESSAGE ? process.env.WEBHOOK_ON_REVOKED_MESSAGE === 'true' : true,
    onLabelUpdated: process.env.WEBHOOK_ON_LABEL_UPDATED ? process.env.WEBHOOK_ON_LABEL_UPDATED === 'true' : true,
    onSelfMessage: process.env.WEBHOOK_ON_SELF_MESSAGE ? process.env.WEBHOOK_ON_SELF_MESSAGE === 'true' : false,
    sendApi: process.env.WEBHOOK_SEND_API ? process.env.WEBHOOK_SEND_API === 'true' : false,
    globalXToken: process.env.WEBHOOK_GLOBAL_X_TOKEN || undefined,
    ignore: process.env.WEBHOOK_IGNORE ? process.env.WEBHOOK_IGNORE.split(',') : ['status@broadcast'],
  },
  websocket: {
    autoDownload: process.env.WEBSOCKET_AUTO_DOWNLOAD ? process.env.WEBSOCKET_AUTO_DOWNLOAD === 'true' : false,
    uploadS3: process.env.WEBSOCKET_UPLOAD_S3 ? process.env.WEBSOCKET_UPLOAD_S3 === 'true' : false,
  },
  chatwoot: {
    sendQrCode: process.env.CHATWOOT_SEND_QR_CODE ? process.env.CHATWOOT_SEND_QR_CODE === 'true' : true,
    sendStatus: process.env.CHATWOOT_SEND_STATUS ? process.env.CHATWOOT_SEND_STATUS === 'true' : true,
  },
  archive: {
    enable: process.env.ARCHIVE_ENABLE ? process.env.ARCHIVE_ENABLE === 'true' : false,
    waitTime: process.env.ARCHIVE_WAIT_TIME ? parseInt(process.env.ARCHIVE_WAIT_TIME) : 10,
    daysToArchive: process.env.ARCHIVE_DAYS_TO_ARCHIVE ? parseInt(process.env.ARCHIVE_DAYS_TO_ARCHIVE) : 45,
  },
  log: {
    level: process.env.LOG_LEVEL || 'silly', // Before open a issue, change level to silly and retry a action
    logger: process.env.LOG_LOGGER ? process.env.LOG_LOGGER.split(',') : ['console', 'file'],
  },
  createOptions: {
    browserArgs: process.env.CREATE_OPTIONS_BROWSER_ARGS ? process.env.CREATE_OPTIONS_BROWSER_ARGS.split(',') : [
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
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
    ],
    /**
     * Example of configuring the linkPreview generator
     * If you set this to 'null', it will use global servers; however, you have the option to define your own server
     * Clone the repository https://github.com/wppconnect-team/wa-js-api-server and host it on your server with ssl
     *
     * Configure the attribute as follows:
     * linkPreviewApiServers: [ 'https://www.yourserver.com/wa-js-api-server' ]
     */
    linkPreviewApiServers: process.env.CREATE_OPTIONS_LINK_PREVIEW_API_SERVERS ? process.env.CREATE_OPTIONS_LINK_PREVIEW_API_SERVERS.split(',') : null,

    /**
     * Set specific whatsapp version
     */
    whatsappVersion: process.env.CREATE_OPTIONS_WHATSAPP_VERSION || undefined,
  },
  mapper: {
    enable: process.env.MAPPER_ENABLE ? process.env.MAPPER_ENABLE === 'true' : false,
    prefix: process.env.MAPPER_PREFIX || 'tagone-',
  },
  db: {
    mongodbDatabase: process.env.DB_MONGODB_DATABASE || 'tokens',
    mongodbCollection: process.env.DB_MONGODB_COLLECTION || '',
    mongodbUser: process.env.DB_MONGODB_USER || '',
    mongodbPassword: process.env.DB_MONGODB_PASSWORD || '',
    mongodbHost: process.env.DB_MONGODB_HOST || '',
    mongoIsRemote: process.env.DB_MONGO_IS_REMOTE ? process.env.DB_MONGO_IS_REMOTE === 'true' : true,
    mongoURLRemote: process.env.DB_MONGO_URL_REMOTE || '',
    mongodbPort: process.env.DB_MONGODB_PORT ? parseInt(process.env.DB_MONGODB_PORT) : 27017,
    redisHost: process.env.DB_REDIS_HOST || 'localhost',
    redisPort: process.env.DB_REDIS_PORT ? parseInt(process.env.DB_REDIS_PORT) : 6379,
    redisPassword: process.env.DB_REDIS_PASSWORD || '',
    redisDb: process.env.DB_REDIS_DB ? parseInt(process.env.DB_REDIS_DB) : 0,
    redisPrefix: process.env.DB_REDIS_PREFIX || 'docker',
  },
  aws_s3: {
    region: process.env.AWS_S3_REGION || 'sa-east-1' as any,
    access_key_id: process.env.AWS_S3_ACCESS_KEY_ID || null,
    secret_key: process.env.AWS_S3_SECRET_KEY || null,
    defaultBucketName: process.env.AWS_S3_DEFAULT_BUCKET_NAME || null,
    endpoint: process.env.AWS_S3_ENDPOINT || null,
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE || null,
  },
} as unknown as ServerOptions;

import { ServerOptions } from './types/ServerOptions';

export default {
  secretKey: process.env.SECRET_KEY || 'MY_SECRET_KEY',
  host: process.env.HOST || 'http://localhost',
  port: process.env.PORT || '21465',
  deviceName: process.env.DEVICE_NAME || 'WppConnect',
  poweredBy: process.env.POWERED_BY || 'WPPConnect-Server',
  startAllSession: process.env.START_ALL_SESSION === 'true' || false,
  tokenStoreType: process.env.TOKEN_STORE_TYPE || 'file',
  maxListeners: parseInt(process.env.MAX_LISTENERS || '15'),
  customUserDataDir: process.env.CUSTOM_USER_DATA_DIR || './userDataDir/',
  webhook: {
    url: process.env.WEBHOOK_URL || null,
    autoDownload: process.env.WEBHOOK_AUTO_DOWNLOAD === 'true' || true,
    uploadS3: process.env.WEBHOOK_UPLOAD_S3 === 'true' || false,
    readMessage: process.env.WEBHOOK_READ_MESSAGE === 'true' || true,
    allUnreadOnStart:
      process.env.WEBHOOK_ALL_UNREAD_ON_START === 'true' || false,
    listenAcks: process.env.WEBHOOK_LISTEN_ACKS === 'true' || true,
    onPresenceChanged:
      process.env.WEBHOOK_ON_PRESENCE_CHANGED === 'true' || true,
    onParticipantsChanged:
      process.env.WEBHOOK_ON_PARTICIPANTS_CHANGED === 'true' || true,
    onReactionMessage:
      process.env.WEBHOOK_ON_REACTION_MESSAGE === 'true' || true,
    onPollResponse: process.env.WEBHOOK_ON_POLL_RESPONSE === 'true' || true,
    onRevokedMessage: process.env.WEBHOOK_ON_REVOKED_MESSAGE === 'true' || true,
    onLabelUpdated: process.env.WEBHOOK_ON_LABEL_UPDATED === 'true' || true,
    onSelfMessage: process.env.WEBHOOK_ON_SELF_MESSAGE === 'true' || false,
    ignore: [process.env.WEBHOOK_IGNORE || 'status@broadcast'],
  },
  websocket: {
    autoDownload: process.env.WEBSOCKET_AUTO_DOWNLOAD === 'true' || false,
    uploadS3: process.env.WEBSOCKET_UPLOAD_S3 === 'true' || false,
  },
  chatwoot: {
    sendQrCode: process.env.CHATWOOT_SEND_QR_CODE === 'true' || true,
    sendStatus: process.env.CHATWOOT_SEND_STATUS === 'true' || true,
  },
  archive: {
    enable: process.env.ARCHIVE_ENABLE === 'true' || false,
    waitTime: parseInt(process.env.ARCHIVE_WAIT_TIME || '10'),
    daysToArchive: parseInt(process.env.ARCHIVE_DAYS_TO_ARCHIVE || '45'),
  },
  log: {
    level: process.env.LOG_LEVEL || 'silly', // Before open a issue, change level to silly and retry a action
    logger: process.env.LOG_LOGGER
      ? process.env.LOG_LOGGER.split(',')
      : ['console', 'file'],
  },
  createOptions: {
    browserArgs: [
      '--disable-web-security',
      '--no-sandbox',
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
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      '--disable-setuid-sandbox',
      '--disable-features=RendererCodeIntegrity',
      '--disable-ipc-flooding-protection',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-features=LeakyPeeker', // Prevents browser sleep mode, avoiding crashes
      '--disable-component-update', // Prevents component updates that can cause navigation
      '--disable-features=TranslateUI', // Disables translation UI that can cause navigation
      '--disable-features=AutofillServerCommunication', // Disables autofill server communication
      '--disable-features=MediaRouter', // Disables media router
      '--disable-features=OptimizationHints', // Disables optimization hints
      '--disable-features=InterestFeedContentSuggestions', // Disables interest feed
      '--disable-features=InterestCohortAPI', // Disables interest cohort API
    ],
    puppeteerOptions: {
      headless: true,
      ignoreHTTPSErrors: true,
      timeout: 60000, // 60 segundos de timeout
      waitForInitialPage: false, // Não espera pela página inicial para evitar problemas de navegação
    },
    /**
     * Example of configuring the linkPreview generator
     * If you set this to 'null', it will use global servers; however, you have the option to define your own server
     * Clone the repository https://github.com/wppconnect-team/wa-js-api-server and host it on your server with ssl
     *
     * Configure the attribute as follows:
     * linkPreviewApiServers: [ 'https://www.yourserver.com/wa-js-api-server' ]
     */
    linkPreviewApiServers: null,

    /**
     * Set specific whatsapp version
     */
    // whatsappVersion: '2.xxxxx',
  },
  mapper: {
    enable: process.env.MAPPER_ENABLE === 'true' || false,
    prefix: process.env.MAPPER_PREFIX || 'tagone-',
  },
  db: {
    mongodbDatabase: process.env.MONGODB_DATABASE || 'tokens',
    mongodbCollection: process.env.MONGODB_COLLECTION || '',
    mongodbUser: process.env.MONGODB_USER || '',
    mongodbPassword: process.env.MONGODB_PASSWORD || '',
    mongodbHost: process.env.MONGODB_HOST || '',
    mongoIsRemote: process.env.MONGO_IS_REMOTE === 'true' || true,
    mongoURLRemote: process.env.MONGO_URL_REMOTE || '',
    mongodbPort: parseInt(process.env.MONGODB_PORT || '27017'),
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379'),
    redisPassword: process.env.REDIS_PASSWORD || '',
    redisDb: parseInt(process.env.REDIS_DB || '0'),
    redisPrefix: process.env.REDIS_PREFIX || 'docker',
  },
  aws_s3: {
    region: (process.env.AWS_REGION || 'sa-east-1') as any,
    access_key_id: process.env.AWS_ACCESS_KEY_ID || null,
    secret_key: process.env.AWS_SECRET_KEY || null,
    defaultBucketName: process.env.AWS_DEFAULT_BUCKET_NAME || null,
    endpoint: process.env.AWS_ENDPOINT || null,
    forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true' || null,
  },
} as unknown as ServerOptions;

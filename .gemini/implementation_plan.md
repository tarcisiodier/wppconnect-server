# Implementation Plan - Redis Cache Configuration

Enable Redis cache for wppconnect-server and optimize docker-compose configuration using environment variables.

## Proposed Changes

### Configuration
#### [MODIFY] .env
- Change `DB_REDIS_HOST` to `wpp-redis` (container name).
- Ensure `TOKEN_STORE_TYPE` is `redis`.

### Infrastructure
#### [MODIFY] docker-compose.yml
- **wppconnect service**:
    - Update volume to use `${CUSTOM_USER_DATA_DIR}` for `userDataDir`.
- **redis service**:
    - Add `command` to start redis with password: `redis-server --requirepass ${DB_REDIS_PASSWORD}`.
    - Ensure ports and volumes are correctly configured.

## Verification Plan

### Manual Verification
1. Stop running containers: `docker compose down`
2. Start containers: `docker compose up -d`
3. View logs to confirm connection:
   ```bash
   docker compose logs -f wppconnect
   ```
   Expected output should indicate successful connection to Redis and TokenStore type as Redis.

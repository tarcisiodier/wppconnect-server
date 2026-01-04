# Tasks

- [ ] Create Implementation Plan
- [x] Update .env
    - [x] Set DB_REDIS_HOST=wpp-redis
- [x] Update docker-compose.yml
    - [x] Configure Redis service with password from env
    - [x] Update wppconnect volume to use CUSTOM_USER_DATA_DIR
- [x] Verify
    - [x] Start services
    - [x] Check logs
        - [x] Initial check failed (Redis v3 vs v4)
        - [x] Update code for Redis v4 compatibility
        - [x] Re-verify logs

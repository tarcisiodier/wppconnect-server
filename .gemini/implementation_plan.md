# Implementation Plan - Token Persistence and Injection

The user wants to persist a `token` (likely an auth token) into the session store and ensure it's available in webhooks.
Currently, `RedisTokenStore` hardcodes `JSON.stringify` and `JSON.parse`, ignoring the custom `encodeFunction`/`decodeFunction` defined in `CreateSessionUtil`.
Also, the `token` itself needs to be passed to `encodeFunction` to be saved.

## Proposed Changes

### 1. `src/util/tokenStore/redisTokenStory.ts`

-   Refactor `constructor` to accept an `options` object (or just `client` as is, but ensure it uses the client's defined encode/decode functions if available).
-   Actually, `CreateSessionUtil` defines `encodeFunction` and `decodeFunction`. In `FileTokenStore`, these are passed via options.
-   In `RedisTokenStore`, we should check if `client.config.tokenStore?.encodeFunction` exists (or similar) or simpler: match `FileTokenStore` pattern where `encodeFunction` is an option.
-   However, looking at `createSessionUtil.ts`, it seems `start` method (part of wppconnect) takes `tokenStore` object which has `getToken`, `setToken`, etc.
-   The critical issue: `RedisTokenStore` logic is hardcoded.
-   **Plan**: Modify `RedisTokenStore` to use `this.client.encodeFunction` and `this.client.decodeFunction` if they exist (or passed in constructor), defaulting to JSON.
    -   Wait, `CreateSessionUtil` has these methods. When it creates `new Factory()`, it passes `client`.
    -   So in `RedisTokenStore`, `this.client` is the `client` object.
    -   We need to ensure `CreateSessionUtil` attaches `encodeFunction` and `decodeFunction` to the `client` or passes them to the factory.
    -   Looking at `createSessionUtil.ts`: `const myTokenStore = tokenStore.createTokenStory(client);`. It doesn't seem to attach them to `client` *before* creating the store, but `wppconnect` library usually handles this via options.
    -   **Simpler Approach**: hardcode the fix in `RedisTokenStore` to call `this.client.encodeFunction` if it exists.
    -   And update `setToken` to pass `client.webhook` and `client.token` to `encodeFunction`.

### 2. `src/util/createSessionUtil.ts`

-   **Modify `encodeFunction`**:
    ```typescript
    encodeFunction(data: any, webhook: any, token: any) {
      data.webhook = webhook;
      data.token = token;
      return JSON.stringify(data);
    }
    ```
-   **Modify `decodeFunction`**:
    ```typescript
    decodeFunction(text: any, client: any) {
      const object = JSON.parse(text);
      if (object.webhook && !client.webhook) client.webhook = object.webhook;
      if (object.token && !client.token) client.token = object.token;
      delete object.webhook;
      delete object.token;
      return object;
    }
    ```
-   **Inject Token in Webhooks**:
    -   In `listenMessages` (`onmessage` and `onselfmessage`):
        -   `message.token = client.token;`

### 3. Update `RedisTokenStore` (`src/util/tokenStore/redisTokenStory.ts`)

-   **Modify `getToken`**:
    -   Use `decodeFunction` if available.
    -   `const object = this.client.decodeFunction ? this.client.decodeFunction(reply, this.client) : JSON.parse(reply);`
-   **Modify `setToken`**:
    -   Use `encodeFunction` if available.
    -   `const text = this.client.encodeFunction ? this.client.encodeFunction(tokenData, this.client.config.webhook, this.client.token) : JSON.stringify(tokenData);`

**Wait**, does `CreateSessionUtil` bind `encodeFunction` to `client`?
In `createSessionUtil.ts`: `const wppClient = await create({...})`. It passes `tokenStore: myTokenStore`.
The `tokenStore` usage is internal to `wppconnect`.
The `encodeFunction` and `decodeFunction` methods in `CreateSessionUtil` class are NOT automatically used by `RedisTokenStore` unless we wire them up.
In `FileTokenStore`, `options` are passed.
In `RedisTokenStore` (checked in Step 438), it takes `client`.
I need to add `client.encodeFunction = this.encodeFunction;` and `client.decodeFunction = this.decodeFunction;` in `createSessionUtil.ts` BEFORE creating the token store.

**Refined Plan**:
1.  In `createSessionUtil.ts`, inside `createSessionUtil` method, before `new Factory()`:
    -   `client.encodeFunction = this.encodeFunction;`
    -   `client.decodeFunction = this.decodeFunction;`
2.  Update `RedisTokenStore` to use these functions from `this.client` if present.
3.  Update `encodeFunction` / `decodeFunction` signatures and logic as requested.
4.  Inject `client.token` into webhooks.

## Verification Plan
1.  Deploy.
2.  User verifies webhook payload.

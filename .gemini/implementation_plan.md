# Implementation Plan - Enrich `onselfmessage` Webhook Data

The user wants to enrich the `onselfmessage` webhook with data about the *recipient* of the message, similar to how we enriched `onmessage` with sender data.

## Proposed Changes

### `src/util/createSessionUtil.ts`

#### [MODIFY] `listenMessages` (inside `client.onAnyMessage`)
- Locate the `onselfmessage` logic (where `req.serverOptions.webhook.onSelfMessage && message.fromMe` is true).
- Inside the valid block (before `callWebHook`):
  - Check if `message.to` is valid.
  - Call `client.getPnLidEntry(message.to)` to retrieve the recipient's contact details (including LID).
  - Attach this data to the `message` object as `message.recipientObj`.
  - Pass the enriched `message` to `callWebHook`.

## Verification Plan

### Manual Verification
1. Rebuild and restart the container.
2. Verify logs show successful startup.
3. (Implicit) User will verify the webhook payload contains `recipientObj`.

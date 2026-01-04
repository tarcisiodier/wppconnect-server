# Implementation Plan - Enrich Webhook Data

The user wants to receive full contact information (including LID and phone number details) in the `onmessage` webhook. The current `sender` object is incomplete.

## Proposed Changes

### `src/util/createSessionUtil.ts`

#### [MODIFY] `listenMessages`
- Inside the `client.onMessage` callback:
  - Check if `message.from` is valid.
  - Call `client.getContact(message.from)` to retrieve full contact details.
  - Attach this data to the `message` object (e.g., as `message.senderObj`).
  - Pass the enriched `message` to `callWebHook`.

## Verification Plan

### Manual Verification
1. Rebuild and restart the container.
2. Observe logs (if we add logging) or rely on user to verify the webhook payload.
3. Since I cannot receive the webhook myself, I will verify the code compiles and the service starts.

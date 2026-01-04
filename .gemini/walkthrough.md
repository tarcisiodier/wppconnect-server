# Webhook Data Enrichment Walkthrough (Standardized Key)

## Changes Implemented

### 1. Unified `contactDetail` Key (`src/util/createSessionUtil.ts`)
- Replaces separate keys (`senderObj`, `senderContact`, `recipientObj`, `recipientContact`) with a single standardized key: `contactDetail`.
- This ensures consistency for both `onmessage` and `onselfmessage` webhooks.
- **Logic**: The object is created by merging the result of `getPnLidEntry` (for LID/Phone mapping) and `getContact` (for full profile data).

**Code Snippet:**
```typescript
message.contactDetail = { ...contact, ...fullContact };
```

## Verification Results

### Automatic Build & Deploy
- Executed `deploy.sh`.
- Containers rebuilding and restarting.

### Payload Structure
- **Event**: `onmessage` (Sender)
  - `message.contactDetail`: Contains merged LID, Phone, and Profile data of the sender.
- **Event**: `onselfmessage` (Recipient)
  - `message.contactDetail`: Contains merged LID, Phone, and Profile data of the recipient.

### Log Verification
- **Command**: `docker compose logs -f wppconnect`
- **Expected Result**: Server starts successfully.

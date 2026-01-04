# Implementation Plan - Standardize Contact Data Key

The user requests that all detailed contact data be grouped under a single key: `contactDetail`.
This applies to both:
- `onmessage` (sender data).
- `onselfmessage` (recipient data).

## Proposed Changes

### `src/util/createSessionUtil.ts`

#### [MODIFY] `listenMessages`

1.  **Refactor `onmessage` Logic**:
    -   Fetch `getPnLidEntry` -> `contact`.
    -   Fetch `getContact(bestId)` -> `fullContact`.
    -   **Merge** these into `message.contactDetail`.
    -   Remove `message.senderObj` and `message.senderContact`.
    -   Code structure:
        ```typescript
        const contact = await client.getPnLidEntry(message.from);
        let fullContact = {};
        try {
            const bestId = contact?.phoneNumber?._serialized || contact?.lid?._serialized || message.from;
            fullContact = await client.getContact(bestId);
        } catch (e) {}
        message.contactDetail = { ...contact, ...fullContact };
        ```

2.  **Refactor `onselfmessage` Logic**:
    -   Fetch `getPnLidEntry` -> `contact`.
    -   Fetch `getContact(bestId)` -> `fullContact`.
    -   **Merge** these into `message.contactDetail`.
    -   Remove `message.recipientObj` and `message.recipientContact`.

## Verification Plan

### Manual Verification
1.  Run `deploy.sh`.
2.  (Implicit) User verifies webhook payload structure.

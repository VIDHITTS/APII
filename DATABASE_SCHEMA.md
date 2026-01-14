# Database Schema Documentation

The application uses MongoDB to store local records and synchronization metadata. Below are the schemas for the core collections.

## 1. Contacts Collection (`contacts`)

Stores individual contact records. `email` is used as the unique identifier.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Primary Key |
| `email` | String | Yes | Unique email address (indexed) |
| `firstname` | String | No | Contact's first name |
| `lastname` | String | No | Contact's last name |
| `phone` | String | No | Phone number |
| `company` | String | No | Associated company name |
| `hubspotId` | String | No | ID of the corresponding record in HubSpot (indexed, unique, sparse) |
| `syncStatus` | String | Yes | Enum: `SYNCED`, `PENDING`, `FAILED`, `CONFLICT`, `NEW` |
| `lastSyncedHash` | String | No | Hash of the data from the last successful sync (used for dirty checking) |
| `lastModifiedLocal` | Date | Yes | Timestamp of last local edit |
| `lastModifiedHubSpot` | Date | No | Timestamp of last confirmed HubSpot update |

## 2. Companies Collection (`companies`)

Stores company/organization records. `domain` is often used as a unique key for deduplication.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Primary Key |
| `name` | String | Yes | Company name |
| `domain` | String | No | Company website domain (indexed, unique, sparse) |
| `industry` | String | No | Industry sector |
| `address` | String | No | Physical address |
| `phone` | String | No | Main phone number |
| `hubspotId` | String | No | HubSpot Company ID (indexed, unique, sparse) |
| `syncStatus` | String | Yes | Enum: `SYNCED`, `PENDING`, `FAILED`, `CONFLICT`, `NEW` |
| `lastSyncedHash` | String | No | Hash of content for change detection |

## 3. Conflicts Collection (`conflicts`)

Stores active data conflicts requiring user intervention.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `entityType` | String | Yes | `contact` or `company` |
| `localId` | ObjectId | Yes | Reference to the local entity |
| `hubspotId` | String | Yes | Reference to the HubSpot entity |
| `localData` | Object | No | Snapshot of local data at time of conflict |
| `hubspotData` | Object | No | Snapshot of incoming HubSpot data |
| `status` | String | Yes | `OPEN`, `PENDING`, `RESOLVED` |
| `conflictMetadata` | Map | No | Details on conflict reason (e.g., `DATA_MISMATCH`) |
| `resolutionStrategy`| String | No | How it was resolved (e.g., `KEEP_LOCAL`) |
| `detectedAt` | Date | Yes | When the conflict was found |

## 4. SyncLogs Collection (`synclogs`)

Audit trail for all synchronization activities (successes and failures).

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `entityType` | String | Yes | `contact` or `company` |
| `entityId` | ObjectId | Yes | Local Entity ID |
| `action` | String | Yes | `CREATE`, `UPDATE`, `DELETE`, `SYNC` |
| `direction` | String | Yes | `INBOUND` (HubSpot -> Local) or `OUTBOUND` (Local -> HubSpot) |
| `status` | String | Yes | `SUCCESS`, `FAILED` |
| `error` | Object | No | Error message and stack trace if failed |
| `duration` | Number | No | Time taken for operation in ms |

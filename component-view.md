# 3. High-Level Overview

The system operates on a simple, robust data flow. The frontend client makes authenticated requests to the backend API, which processes business logic, queries the PostgreSQL database for metadata, and serves audio files securely from S3-compatible storage.

```mermaid
graph TD
    subgraph ALSmusic System
        Frontend(React Client);
        Backend(Backend API - Node.js/Express);
        Database[(PostgreSQL)];
        FileStorage[(S3-compatible Storage)];
    end

    User(Music Producer/User) -->|Interacts With| Frontend;
    Frontend -->|Makes API Calls (REST)| Backend;
    Backend -->|Queries/Mutates Data| Database;
    Backend -->|Uploads/Fetches Files| FileStorage;
```

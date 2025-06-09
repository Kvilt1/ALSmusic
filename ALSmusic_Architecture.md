# ALSmusic Architecture Document

1. **Introduction**  
This document outlines the technical architecture for ALSmusic, a private music-sharing platform. It is designed to be the guiding blueprint for development, ensuring consistency and adherence to the chosen patterns and technologies. The primary goal is to refactor an existing React-based Spotify clone, replacing its public API dependency with a custom-built, secure backend designed for private group-based sharing.

2. **Technical Summary**  
The architecture is a client‑server model operating within a monorepo. The existing React/TypeScript frontend will be refactored to communicate with a new, standalone backend API. This new backend will handle all business logic, including user authentication via JSON Web Tokens (JWTs), group management, and the secure storage/streaming of audio files.

The chosen technology stack is:
 * **Backend:** Node.js with the Express.js framework.  
 * **Database:** PostgreSQL.  
 * **ORM:** Prisma for type‑safe database interaction.  
 * **File Storage:** An AWS S3‑compatible object storage service.

3. **High‑Level Overview**  
The system operates on a simple, robust data flow. The frontend client makes authenticated requests to the backend API, which processes business logic, queries the PostgreSQL database for metadata, and serves audio files securely from S3‑compatible storage.

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

4. **Project Structure (Monorepo)**  
The project will be housed in a single monorepo to simplify development and deployment.
```
/alsmusic-monorepo
├── .github/              # CI/CD workflows (GitHub Actions)
├── packages/
│   ├── frontend/         # The refactored React (Next.js) application
│   │   ├── src/
│   │   └── package.json
│   └── backend/          # The new Node.js/Express API
│       ├── src/
│       └── package.json
├── prisma/               # Prisma schema and migration files
│   └── schema.prisma
├── .gitignore
├── package.json          # Root package.json for monorepo scripts
└── README.md
```

5. **Data Models**  
The following Prisma schema defines the database structure.
```prisma
// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }

// generator client {
//   provider = "prisma-client-js"
// }

enum Role {
  OWNER
  MEMBER
}

model User {
  id              String            @id @default(uuid())
  username        String            @unique
  email           String            @unique
  passwordHash    String
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  songsUploaded   Song[]
  groupMemberships GroupMembership[]
}

model Group {
  id              String            @id @default(uuid())
  name            String
  logoUrl         String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  members         GroupMembership[]
  songs           SongInGroup[]
}

model Song {
  id              String        @id @default(uuid())
  name            String
  coverArtUrl     String?
  audioFileUrl    String
  createdAt       DateTime      @default(now())

  uploaderId      String
  uploader        User          @relation(fields: [uploaderId], references: [id])
  groups          SongInGroup[]
}

model GroupMembership {
  role            Role          @default(MEMBER)
  joinedAt        DateTime      @default(now())

  userId          String
  groupId         String
  user            User          @relation(fields: [userId], references: [id])
  group           Group         @relation(fields: [groupId], references: [id])

  @@id([userId, groupId])
}

model SongInGroup {
  addedAt         DateTime      @default(now())

  songId          String
  groupId         String
  song            Song          @relation(fields: [songId], references: [id])
  group           Group         @relation(fields: [groupId], references: [id])

  @@id([songId, groupId])
}
```

6. **API Reference**

### 6.1. Authentication
| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| /api/v1/auth/register | POST | Creates a new user account. | No |
| /api/v1/auth/login | POST | Authenticates a user and returns a JWT. | No |
| /api/v1/auth/me | GET | Retrieves the profile of the currently logged‑in user. | Yes |

### 6.2. Group Management
| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| /api/v1/groups | GET | Lists all groups the authenticated user is a member of. | Yes |
| /api/v1/groups | POST | Creates a new group. | Yes |
| /api/v1/groups/{groupId} | GET | Retrieves the details of a specific group. | Yes (as member) |
| /api/v1/groups/{groupId}/invites | POST | Invites a user to a group. (Owner only). | Yes (as owner) |
| /api/v1/groups/{groupId}/members/{userId} | DELETE | Removes a member from a group. (Owner only). | Yes (as owner) |

### 6.3. Music Management & Playback
| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| /api/v1/songs | POST | Uploads a new song to one or more groups. | Yes (as member) |
| /api/v1/songs/{songId} | DELETE | Deletes a song. (Uploader only). | Yes (as uploader) |
| /api/v1/songs/{songId}/stream | GET | Securely streams the audio data for a song. | Yes (as member) |
| /api/v1/users/{username}/songs | GET | Retrieves a list of songs uploaded by a specific user. | Yes |

7. **Technology Stack**
| Category | Technology | Version / Specification | Purpose |
|---|---|---|---|
| Frontend | React (with Next.js) | 18.x | User Interface |
|  | Redux Toolkit | 9.x | State Management |
|  | SCSS / CSS Modules | - | Styling |
| Backend | Node.js | 22.x | JavaScript Runtime |
|  | Express.js | 4.x | API Framework |
| Database | PostgreSQL | 16.x | Relational Data Storage |
|  | Prisma | 5.x | ORM & DB Access |
| Authentication | JSON Web Tokens (JWT) | - | Secure Sessions |
| File Storage | S3‑Compatible | - | Storing songs and images |
| Deployment | Docker | - | Containerization |
|  | GitHub Actions | - | CI/CD |
| Testing | Jest, React Testing Library | - | Unit & Integration Testing |

8. **Coding Standards & Best Practices**
 * **Language:** All backend code will be written in modern JavaScript (ES2022+) or TypeScript, to be decided before implementation. All frontend code remains TypeScript.
 * **Style:** ESLint and Prettier will be enforced via CI for consistent code style.
 * **Naming Convention:** Variables and functions will use `camelCase`. Classes and types will use `PascalCase`.
 * **Security:**
   * All API endpoints must perform strict authorization checks to ensure a user has permission to access or modify a resource.
   * Passwords will be hashed with bcrypt.
   * Audio files will be stored in a private S3 bucket and served only through a secure, authenticated `/stream` API endpoint. Direct public URLs to audio files will not be used.
 * **Testing:** Critical backend logic (authentication, permissions) and API endpoints must be covered by unit and integration tests. Frontend components that are heavily repurposed will be tested to ensure they function correctly with the new API.

9. **Change Log**
| Change | Date | Version | Description | Author |
|---|---|---|---|---|
| Initial Document Creation | 2025-06-08 | 1.0 | First complete draft based on the PRD for ALSmusic. | Fred, Architect |

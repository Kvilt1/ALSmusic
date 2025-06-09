# 5. Data Models

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

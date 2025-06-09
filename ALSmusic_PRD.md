# ALSmusic Product Requirements Document (PRD)

## Goal, Objective and Context
Goal: The primary goal of ALSmusic is to provide a dedicated, private, and easy-to-use platform for music producers, musicians, and their friends to share their musical works in a secure, invite-only environment.
Objective: The project's objective is to completely refactor the existing "spotify-react-web-client" project into a new application called "ALSmusic". This involves:
 * Removing the dependency on the Spotify API and all related public music library and recommendation features.
 * Designing and implementing a new backend system and API from the ground up to support the creation and management of private, user-created groups.
 * Developing features for secure music uploading, sharing, and playback exclusively within these private groups.
 * Rebranding the user interface to reflect the "ALSmusic" brand with an orange and black color scheme.
Context: Currently, musicians and producers who wish to share work-in-progress or private tracks with a select group of friends or collaborators must use generic file-sharing methods like Dropbox, which can be tedious and are not optimized for music listening. Furthermore, releasing music publicly on platforms like Spotify is not always desirable for unreleased or private tracks. ALSmusic aims to solve this by offering a streamlined, music-centric solution for private sharing among trusted circles.

## Functional Requirements (MVP)

### User & Group Management
 * User Accounts: Users must be able to sign up for an account with a unique ALSmusic username.
 * Group Creation: A user can create a new group, becoming its owner.
 * Group Configuration: The group owner can set and change the group's name and logo.
 * Membership: The group owner can invite other registered users to the group by their ALSmusic username and can also remove members from the group.
 * Multi-group Membership: A single user can create and/or be a member of multiple groups.

### Music Sharing & Playback
 * Song Upload: All members of a group are permitted to upload songs. The upload form will allow the user to select one or more of their groups to share the track with simultaneously.
 * Song Deletion: A song can only be deleted by the original uploader.
 * Song Metadata: The upload process must allow the user to specify the song's name and provide a custom song cover image.
 * File Support: The system will support all popular music formats, explicitly including .wav. There will be no technical file size limit for uploads.
 * Playback: All members of a group can stream the songs shared within it.
 * Downloading: All members of a group have the ability to download the original uploaded song file.

### User Profile Page
 * Repurposed "Artist Page": The concept of an "Artist Page" will be repurposed into a "User Profile Page".
 * Profile Accessibility: Each user will have a profile page, accessible by clicking their username anywhere it appears.
 * Content: The profile page will list all songs uploaded by that user. A viewer will only see songs from groups they have in common with the profile owner.
 * Group Context: Each song listed on the profile page must have a clear indicator of which group it belongs to.

### Notifications (MVP)
 * In-App System: The application will feature a simple, in-app notification system (e.g., a bell icon).
 * Key Events: Users will receive notifications for new group invitations and new songs being added to their groups.

## Non-Functional Requirements (MVP)

### Performance
 * UI Responsiveness: The web application should feel fast and responsive, with page loads and UI transitions completing within 1-2 seconds on a standard broadband connection.
 * Music Streaming: Music playback should begin streaming within 3 seconds of a user pressing play under normal network conditions.

### Security
 * Authentication: User passwords must be securely hashed and salted using a modern, strong algorithm (e.g., bcrypt).
 * Authorization: The backend API must enforce strict authorization checks. A user must be a member of a group to view its content. Only the uploader may delete a song. Only the owner may manage members.
 * Data Privacy: All user data and uploaded music files must be private and inaccessible to anyone outside of their designated group.

### Reliability & Availability
 * Uptime: The service should aim for a 99.5% uptime for its core functionalities.
 * Data Integrity: The system must ensure that uploaded song files are stored without corruption and metadata is accurately maintained.

### Maintainability
 * Code Quality: The codebase must adhere to clear coding standards and architectural patterns to ensure the application is easy to understand, modify, and extend post-MVP.

## User Interaction and Design Goals
 * Uploader as "Artist": The UI element that previously displayed the "Artist" for a track will now display the username of the Uploader. This username will be a direct link to that user's Profile Page.
 * Group Creation Flow: A + icon in the sidebar will trigger a modal for group creation.
 * Song Upload Flow: An "upload" UI element will open a dedicated menu for uploading a track, setting its metadata, and selecting one or more groups to share it with.
 * Group Navigation: The repurposed left sidebar will be the primary mechanism for switching between a user's groups.
 * Player UI: The core music player interface will be functionally and visually identical to the one in the current version of the project.

## Feature Repurposing & Removal Strategy
 * KEEP & REPURPOSE: Playback Bar, Fullscreen Player, Modals, Menus, Playlist Page (-> Group View), Artist Page (-> User Profile), Liked Songs Page (-> My Uploads), Search (scoped to current group).
 * REMOVE: Album Page, all recommendation and discovery features (Made For You, Trending, etc.).

## Epic Overview

### Epic 1: Initial Rebranding & Styling
   * Goal: To remove all existing Spotify branding from the application and establish the new "ALSmusic" brand identity with an orange and black color scheme.
   * Story 1.1: Replace Logos and Favicons: As a user, I want to see the ALSmusic logo and favicon throughout the application.
   * Story 1.2: Update Color Scheme: As a user, I want the application's color scheme to be orange and black instead of green and black.
   * Story 1.3: Update Text and Naming: As a user, I want all text within the application to refer to 'ALSmusic' instead of 'Spotify'.

### Epic 2: Project Foundation & User Authentication
   * Goal: To establish the technical foundation and implement a secure user registration and login system.
   * Story 2.1: Basic Project & API Setup: As a developer, I want to set up the initial monorepo structure with a basic backend server and database connection.
   * Story 2.2: User Registration API Endpoint: As a new user, I want to submit my details to a secure API to create my account.
   * Story 2.3: User Registration UI: As a new user, I want a sign-up page to enter my details and create my account.
   * Story 2.4: User Login API Endpoint & Token Generation: As a registered user, I want to send my credentials to a secure API to verify my identity and receive an auth token.
   * Story 2.5: User Login UI & Session Management: As a registered user, I want a login page, and upon success, have the application remember that I am logged in.

### Epic 3: Core Group Functionality
   * Goal: To enable users to create, manage, and navigate their private, invite-only groups.
   * Story 3.1: Group Creation UI & API: As a user, I want to use the + button in the sidebar to create a new private group.
   * Story 3.2: Basic Group View: As a member, I want to select a group and see a page with its details and song list.
   * Story 3.3: Member Invitation UI & API: As an owner, I want to invite other registered users to my group by their username.
   * Story 3.4: View and Manage Group Members: As a member, I want to view the member list. As an owner, I also want to be able to remove members.
   * Story 3.5: Repurpose Sidebar for Group Navigation: As a user, I want the left sidebar to list all my groups so I can switch between them.

### Epic 4: Music Upload & Management
   * Goal: To allow group members to upload, manage, and share their music files.
   * Story 4.1: Music File Upload API: As a developer, I need a secure endpoint to process, store, and create a database record for an uploaded audio file, associating it with one or more groups.
   * Story 4.2: Music Upload UI: As a member, I want a form to select an audio file, add metadata, and choose one or more groups to upload it to.
   * Story 4.3: Display Songs in Group View: As a member, I want to see a list of all uploaded songs within the "Group View Page."
   * Story 4.4: Song Deletion UI & API: As the uploader, I want a "delete" option to permanently remove my track.

### Epic 5: In-Group Music Playback & Navigation
   * Goal: To provide a seamless music playback experience and ensure all navigation links work correctly.
   * Story 5.1: Basic Music Playback: As a member, I want to click any song in a group and have it play in the player bar.
   * Story 5.2: Play Queue Logic: As a listener, when I play a song, I want the rest of the songs in the list to be added to a "play next" queue.
   * Story 5.3: User Profile Page Implementation: As a user, I want to click an uploader's name to see their profile page with all their tracks.
   * Story 5.4: Finalize All Navigation Links: As a user, I want all links (group names, user profiles) to navigate to the correct page.

## Out of Scope Ideas Post MVP
 * Algorithmic recommendations and music discovery features.
 * A formal "Album" entity for grouping songs.
 * Advanced user permission roles (e.g., "listener-only").
 * Separate, displayable "artist names" for user profiles.
 * Email-based notifications (MVP will have in-app notifications only).

## Initial Architect Prompt
Based on the requirements in this PRD, the next step is to create the technical architecture. The key directives are:
 * The system must be built in a Monorepo.
 * The architecture must support the 5 Epics defined above, including a new backend API and database designed from scratch to support groups, users, and private song management.
 * All integration with the public Spotify API must be removed.
 * The new backend API should be designed to be highly compatible with the data structures expected by the existing frontend components to maximize code reuse and development efficiency.

## Change Log
| Change | Date | Version | Description | Author |
|---|---|---|---|---|
| Initial Document Creation | 2025-06-08 | 1.0 | First complete draft of the PRD for ALSmusic. | John, PM |

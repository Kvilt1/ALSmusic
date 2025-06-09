# 6. API Reference

### 6.1. Authentication

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| /api/v1/auth/register | POST | Creates a new user account. | No |
| /api/v1/auth/login | POST | Authenticates a user and returns a JWT. | No |
| /api/v1/auth/me | GET | Retrieves the profile of the currently logged-in user. | Yes |

### 6.2. Group Management

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| /api/v1/groups | GET | Lists all groups the authenticated user is a member of. | Yes |
| /api/v1/groups | POST | Creates a new group. | Yes |
| /api/v1/groups/{groupId} | GET | Retrieves the details of a specific group. | Yes (as member) |
| /api/v1/groups/{groupId}/invites | POST | Invites a user to a group. (Owner only). | Yes (as owner) |
| /api/v1/groups/{groupId}/members/{userId} | DELETE | Removes a member from a group. (Owner only). | Yes (as owner) |

### 6.3. Music Management & Playback

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| /api/v1/songs | POST | Uploads a new song to one or more groups. | Yes (as member) |
| /api/v1/songs/{songId} | DELETE | Deletes a song. (Uploader only). | Yes (as uploader) |
| /api/v1/songs/{songId}/stream | GET | Securely streams the audio data for a song. | Yes (as member) |
| /api/v1/users/{username}/songs | GET | Retrieves a list of songs uploaded by a specific user. | Yes |

# 8. Coding Standards & Best Practices

-   **Language:** All backend code will be written in modern JavaScript (ES2022+) or TypeScript, to be decided before implementation. All frontend code remains TypeScript.
-   **Style:** ESLint and Prettier will be enforced via CI for consistent code style.
-   **Naming Convention:** Variables and functions will use `camelCase`. Classes and types will use `PascalCase`.
-   **Security:**
    -   All API endpoints must perform strict authorization checks to ensure a user has permission to access or modify a resource.
    -   Passwords will be hashed with bcrypt.
    -   Audio files will be stored in a private S3 bucket and served only through a secure, authenticated `/stream` API endpoint. Direct public URLs to audio files will not be used.
-   **Testing:** Critical backend logic (authentication, permissions) and API endpoints must be covered by unit and integration tests. Frontend components that are heavily repurposed will be tested to ensure they function correctly with the new API.

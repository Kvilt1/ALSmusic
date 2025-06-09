# 4. Project Structure (Monorepo)

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

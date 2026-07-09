# LibraryNexus

LibraryNexus is a full-stack library management system for study libraries. It includes admin authentication, student records, seat management, fee payments, dashboard analytics, public library websites, themes, Hindi translations, and Cloudinary-backed image uploads.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Query, Wouter
- Backend: Express, Mongoose, MongoDB, JWT, Pino, Helmet
- Database: MongoDB Atlas
- Storage: Cloudinary
- Package manager: pnpm workspaces

## Project Structure

```text
client/                 Vite frontend application
server/                 Express API service
lib/api-client-react/   Generated React Query API client
lib/api-zod/            Generated API schemas
lib/api-spec/           OpenAPI specification
docs/                   Production and deployment notes
```

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

Create the initial super admin by setting `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` in `.env` before starting the backend. Use the Super Admin panel to create library admin accounts.

## Required Production Environment Variables

Backend:

- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `CLIENT_URL`

Frontend:

- `VITE_API_URL`
- `VITE_APP_URL`

See [.env.example](.env.example) and [deployment-guide.md](docs/deployment-guide.md).

## Commands

```bash
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-server run start
pnpm --filter @workspace/library-app run build
```

## Deployment Targets

- Backend: Render Web Service
- Frontend: Render Static Site
- Database: MongoDB Atlas
- Storage: Cloudinary

Deployment instructions and checklists are in [docs/deployment-guide.md](docs/deployment-guide.md).

Sample Login credentials = "admin@library.com" and password is admin123

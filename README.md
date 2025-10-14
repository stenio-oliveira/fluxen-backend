# Development with Docker

This repository includes a development Dockerfile and a docker-compose configuration to run the Node.js backend together with MySQL (and phpMyAdmin).

Quick start

1. Copy or create a `.env` in the project root with any environment variables you need (example below).
2. Start services:

```powershell
docker-compose up --build
```

This will:
- Build the `app` image and run it with `npm run dev` (uses `tsx` watch).
- Start a MySQL 8.0 container with database `sirgs_equipamentos`.
- Start phpMyAdmin on port 8080 for convenience.

Example `.env` (create in project root):

```
# App
PORT=3000

# Database
DATABASE_URL=mysql://sirgs:sirgspassword@db:3306/sirgs_equipamentos
```

Notes
- The compose file maps port 3000 -> 3000 and 8080 -> 80 for phpMyAdmin.
- Prisma expects `DATABASE_URL` in the environment — the example above points the app to the `db` service inside compose.
- If you already have a MySQL instance running, either change the ports or skip the `db` service.

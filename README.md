# TaskFlow

A simple full-stack to-do app — built as a hands-on learning project.

## Tech stack
- **Web + API:** Next.js 14 (App Router) · TypeScript · Tailwind CSS
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Auth:** JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)
- **Mobile:** Flutter *(coming soon)*

## Project structure
```
taskflow/
├─ web/      → Next.js app (frontend + API routes)
└─ mobile/   → Flutter app (coming soon)
```

## Run the web app locally
```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

Create `web/.env` with:
```env
DATABASE_URL="<neon pooled or direct connection>"
DIRECT_URL="<neon direct connection>"
JWT_SECRET="<a long random string>"
```

## API
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account → returns JWT |
| POST | `/api/auth/login` | Log in → returns JWT |
| GET | `/api/tasks` | List your tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

All `/api/tasks` routes require an `Authorization: Bearer <token>` header.

## Deployment
- **Web + API:** Vercel (set **Root Directory = `web`**)
- **Database:** Neon (Postgres)

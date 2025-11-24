# BuddyScript Next

Reimplementation of the BuddyScript experience with Next.js 14 (App Router), Drizzle ORM, and the Neon HTTP driver. Phase 1 delivers a production-ready registration flow that mirrors the provided static assets.

## Tech stack

- Next.js 14 + React 19 with the App Router
- Styling via imported BuddyScript legacy CSS + custom globals
- State/data: Zustand for auth cache, React Query for API hooks
- Database: Neon PostgreSQL via `@neondatabase/serverless` + Drizzle
- **Caching: Redis via Upstash + ioredis for high-performance post reads**
- Auth: secure password hashing with `bcryptjs`, JWT issuance with `jsonwebtoken`
- Docs: Swagger JSDoc + Swagger UI served from `/api/docs`

## Prerequisites

- Node.js 18.17+ (recommended 20.x)
- pnpm 9+
- Access to the shared Neon database (see env vars below)

## Environment variables

Create `.env.local` (already gitignored):

```env
DATABASE_URL=postgresql://neondb_owner:...@ep-sweet-mouse-a1te3p3z-pooler.ap-southeast-1.aws.neon.tech/buddy_script_db?sslmode=require&channel_binding=require
JWT_SECRET=dev_super_secret_key_change_me
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
REDIS_URL=rediss://default:YOUR_PASSWORD@your-instance.upstash.io:6379
```

**Note**: The `REDIS_URL` is required for caching to work. See [CACHING_GUIDE.md](./CACHING_GUIDE.md) for details.

## Installation

```bash
pnpm install
pnpm db:generate   # optional: regenerate SQL from schema changes
pnpm db:migrate    # push schema to Neon (requires credentials above)
pnpm dev
```

The dev server runs at `http://localhost:3000`. Registration lives at `/register`, while API docs live at `/api/docs`.

## Registration flow

1. Navigate to `http://localhost:3000/register`.
2. Fill out first name, last name, email, and a strong password (meets zod constraints).
3. On success, the API stores the user in Neon, issues a short-lived JWT, and the UI redirects to `/login` (stub page for now).

Validation runs on both client (zod) and server. Duplicate emails are rejected with a helpful message. API errors bubble back into the UI via React Query.

### Registration payload example

```json
{
  "firstName": "Avery",
  "lastName": "Lee",
  "email": "avery@example.com",
  "password": "P@ssw0rd!"
}
```

## Project scripts

| Command          | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start Next.js dev server                 |
| `pnpm build`     | Build for production                     |
| `pnpm start`     | Run the production build                 |
| `pnpm lint`      | Run ESLint                               |
| `pnpm db:generate` | Generate SQL migrations via Drizzle    |
| `pnpm db:migrate`  | Push schema to the Neon database       |
| `pnpm db:studio`   | Launch Drizzle Studio                   |

## Documentation

Comprehensive guides and architecture documentation:

- 📚 **[API Documentation](./buddyscript-next/docs/API_DOCUMENTATION.md)** - Complete API reference and endpoints
- 🎨 **[Atomic Design Guide](./buddyscript-next/docs/ATOMIC_DESIGN_GUIDE.md)** - Component design system and patterns
- 🏗️ **[Backend Architecture](./buddyscript-next/docs/BACKEND_ARCHITECTURE.md)** - Backend structure and patterns
- 🗄️ **[Caching Architecture](./buddyscript-next/docs/CACHING_ARCHITECTURE.md)** - Redis caching implementation details
- ⚡ **[Caching Guide](./buddyscript-next/docs/CACHING_GUIDE.md)** - Caching strategies and best practices
- 📐 **[Layered Architecture Guide](./buddyscript-next/docs/LAYERED_ARCHITECTURE_GUIDE.md)** - Application layer structure

## Redis Caching

This application implements a comprehensive Redis caching layer for high-performance post reads:

- **Cache Provider**: Upstash Redis (serverless, global replication)
- **Client**: ioredis with automatic reconnection
- **Strategy**: Cache-Aside pattern with smart invalidation
- **Performance**: Sub-10ms response times for cached data, 80-90% database load reduction

### Quick Start
1. Add `REDIS_URL` to `.env.local` (see Environment variables section)
2. Caching works automatically - no code changes needed
3. Monitor cache hits/misses in application logs
4. Check Upstash dashboard for metrics and monitoring
5. See [Caching Guide](./buddyscript-next/docs/CACHING_GUIDE.md) for detailed documentation

## Testing checklist

- [x] Register success path (new email)
- [x] Validation errors (short password, malformed email)
- [x] Duplicate email conflict bubbles to UI
- [x] Swagger docs generated under `/api/docs`
- [x] Swagger interactive docs at `/docs`


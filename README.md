# Task Overview

Convert the provided static HTML/CSS **Login**, **Register**, and **Feed** pages into a production-ready React.js or Next.js application. You are free to pick any backend stack and database, but the final experience must faithfully match the supplied designs and requirements listed below.

---

## Goals

- React.js or Next.js frontend that mirrors the existing UI.
- Secure authentication flow so only logged-in users reach the feed.
- Scalable backend and database that can handle millions of posts and reads.
- Functional feed experience with posting, likes, comments, replies, and privacy controls.
- Clean documentation, a walkthrough video, and (optionally) a live deployment.

---

## Functional Requirements

### 1. Authentication & Authorization
- Users sign up with **first name**, **last name**, **email**, and **password**.
- Use either session-based auth (cookies) or JWT-based auth (local storage or httpOnly cookies).
- No password reset or “forgot password” flows are needed.
- Protect the feed route: redirect unauthenticated visitors to login.

### 2. Feed Page (Protected Route)
- Show every user’s public posts and each user’s private posts (visible only to them).
- Latest posts appear first.
- Allow text + image uploads when creating posts.
- Provide like/unlike interactions for posts, comments, and replies.
- Render comments, nested replies, and display who liked each entity.
- Support **Public** vs **Private** visibility toggles when creating posts.
- Focus on functionality over decorative elements—follow the base layout, spacing, and typography from the supplied design.

---

## Suggested Architecture

| Layer | Responsibilities | Tech Ideas |
| --- | --- | --- |
| **Frontend** | UI components, routing, auth state, API consumption | Next.js 14 App Router (preferred) or React + Vite |
| **API** | Auth endpoints, post/comment CRUD, like toggles, image upload handling | Next.js API routes, Express, NestJS, Fastify, etc. |
| **Database** | Users, sessions/tokens, posts, comments, replies, likes, media metadata | PostgreSQL, MySQL, MongoDB, Supabase, Planetscale, etc. Use migrations/ORMs for schema management. |
| **Storage** | Persist post images | Cloud storage (S3, Cloudflare R2, Supabase Storage) or DB blobs for MVP |

Design for high read/write volume:
- Index posts by creation time, author, and visibility.
- Preload aggregated like counts and comment totals where possible.
- Use pagination or infinite scroll to avoid loading the entire feed at once.

---

## Development Workflow

1. **Bootstrap Frontend**
   - Initialize React or Next.js project.
   - Port the static HTML/CSS into reusable components.
   - Configure routing for `/login`, `/register`, and `/feed`.

### Phase 1 status

- The new Next.js codebase lives in `buddyscript-next/`. Follow that README for setup, env vars, and the registration walkthrough.
- Legacy static assets remain under `design-system/` for reference and are now piped into the Next.js app (global CSS + icons).

2. **Implement Auth**
   - Build register/login forms with validation.
   - Wire up backend endpoints.
   - Persist auth state (context/store) and guard the feed route.

3. **Build Feed Functionality**
   - Data model: users, posts, comments, replies, likes.
   - CRUD endpoints for posts, comments, replies.
   - Like/unlike endpoints per entity.
   - Implement optimistic UI updates where useful.

4. **Privacy Rules**
   - Public posts: visible to every authenticated user.
   - Private posts: visible only to the owner.
   - Enforce at query and UI layers.

5. **Quality & Security**
   - Input validation on both client and server.
   - Rate limit auth and post creation to mitigate abuse.
   - Sanitize uploaded images and user-generated content.
   - Add loading states, empty states, and error handling.

6. **Documentation & Delivery**
   - Update this README with setup, tech choices, and tradeoffs.
   - Record a short walkthrough video (YouTube unlisted/private).
   - Push the code to GitHub; include deploy URL if available.

---

## Running the Project (Template)

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev server (Next.js example)
pnpm dev

# 3. Run database migrations / seed data as needed
pnpm db:migrate
pnpm db:seed
```

Add environment instructions here once you finalize backend/storage choices, for example:

```env
DATABASE_URL=postgres://user:password@host:5432/app
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
STORAGE_BUCKET_URL=https://your-bucket-url
```

---

## Testing Checklist

- Register + login flow (happy path and validation errors).
- Access control: feed rejects anonymous users.
- Create post with text only and text + image.
- Like/unlike posts, comments, replies; counts update correctly.
- Toggle public/private posts and verify visibility rules.
- Comment and reply threads show in correct order with newest first.
- Responsive layout matches provided design across devices.

---

## Deliverables

- **GitHub repository** containing the React/Next.js code, backend, and documentation.
- **Video walkthrough** (YouTube unlisted/private) demonstrating:
  - Registration, login, logout.
  - Feed browsing, post creation, likes, comments, replies, privacy toggle.
  - Any additional improvements you implemented.
- **Optional deployment** URL (highly recommended for easier review).
- **Documentation**:
  - Tech stack decisions.
  - Setup instructions.
  - Known limitations and future enhancements.

---

## Future Enhancements (Optional Ideas)

- Real-time updates via WebSockets or Server-Sent Events.
- Advanced media handling (video, multiple images, compression).
- Search and filtering (by user, tags, visibility).
- Accessibility audit and improvements.
- Automated tests (unit, integration, e2e) with CI.

---

Build with scalability, security, and UX in mind. Stick to the supplied design, prioritize correctness over extra features, and make sure reviewers can run, test, and evaluate your work quickly. Good luck!

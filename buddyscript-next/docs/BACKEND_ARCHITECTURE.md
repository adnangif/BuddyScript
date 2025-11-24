# Backend Layered Architecture

This document describes the layered architecture implementation for the BuddyScript backend API.

## 📐 Architecture Overview

The backend follows a clean layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│          API Routes (Next.js)              │
│  - HTTP request/response handling          │
│  - Input validation with Zod               │
│  - Error to HTTP status mapping            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           Service Layer                    │
│  - Business logic & workflows              │
│  - Cross-entity operations                 │
│  - Domain invariants enforcement           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Repository Layer                   │
│  - Data access abstraction                 │
│  - Query composition                       │
│  - Entity mapping                          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Database Layer                     │
│  - Drizzle ORM client                      │
│  - Schema definitions                      │
│  - Migrations                              │
└─────────────────────────────────────────────┘
```

## 📂 Directory Structure

```
src/
├── database/
│   └── client.ts              # Database client singleton
│
├── repositories/
│   ├── user.repository.ts     # User data access
│   ├── post.repository.ts     # Post data access
│   ├── comment.repository.ts  # Comment data access
│   ├── postLike.repository.ts # Post likes data access
│   ├── commentLike.repository.ts # Comment likes data access
│   └── index.ts               # Repository exports
│
├── services/
│   ├── auth.service.ts        # Authentication business logic
│   ├── post.service.ts        # Post business logic
│   ├── comment.service.ts     # Comment business logic
│   ├── postLike.service.ts    # Post like business logic
│   ├── commentLike.service.ts # Comment like business logic
│   └── index.ts               # Service exports
│
├── shared/
│   ├── errors/
│   │   └── domain-error.ts    # Custom domain error class
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   └── types/
│       ├── auth.ts            # Auth-related types
│       └── pagination.ts      # Pagination types
│
├── app/api/                   # Next.js API routes
│   ├── auth/
│   │   ├── login/route.ts
│   │   └── register/route.ts
│   ├── posts/
│   │   ├── route.ts
│   │   └── [postId]/
│   │       ├── comments/route.ts
│   │       └── likes/route.ts
│   └── comments/
│       └── [commentId]/
│           ├── likes/route.ts
│           └── replies/route.ts
│
├── db/schema/                 # Drizzle schema definitions
└── lib/validators/            # Zod validation schemas
```

## 🔄 Request Flow Example

### Creating a Post

1. **API Route** (`/api/posts/route.ts`)
   - Validates request body with Zod schema
   - Authenticates user via middleware
   - Calls service layer

2. **Service Layer** (`post.service.ts`)
   - Validates business rules (e.g., content not empty)
   - Calls repository to create post
   - Enriches response with aggregated data (likes, comments)
   - Returns DTO (Data Transfer Object)

3. **Repository Layer** (`post.repository.ts`)
   - Constructs database query
   - Executes insert operation
   - Returns domain entity

4. **Database Layer** (`database/client.ts`)
   - Drizzle ORM executes SQL
   - Returns raw data

## 🧱 Layer Responsibilities

### 1. Database Layer (`src/database/`)

**Purpose:** Provide database connection and client initialization

**Responsibilities:**
- Initialize Drizzle ORM client
- Maintain singleton pattern to prevent connection leaks
- Export typed database client

**Example:**
```typescript
import { dbClient } from "@/database/client";
```

### 2. Repository Layer (`src/repositories/`)

**Purpose:** Abstract data access and provide a clean interface for database operations

**Responsibilities:**
- Execute database queries
- Map database rows to domain entities
- Handle pagination, filtering, sorting
- NO business logic

**Example:**
```typescript
export const postRepository = {
  async findById(postId: string): Promise<PostRecord | null> {
    return await dbClient.query.posts.findFirst({
      where: eq(posts.id, postId),
    });
  },

  async create(payload: CreatePostInput): Promise<PostRecord> {
    const [post] = await dbClient
      .insert(posts)
      .values(payload)
      .returning();
    return post;
  },
};
```

### 3. Service Layer (`src/services/`)

**Purpose:** Implement business logic and orchestrate operations

**Responsibilities:**
- Enforce business rules and invariants
- Coordinate multiple repositories
- Handle transactions
- Transform data to DTOs for API consumption
- Throw domain errors for business rule violations

**Example:**
```typescript
export const postService = {
  async createPost(input: CreatePostInput): Promise<PostDTO> {
    // Business logic: validate content
    if (!input.content.trim()) {
      throw DomainError.validation("Post content cannot be empty");
    }

    // Call repository
    const post = await postRepository.create(input);

    // Enrich with aggregated data
    const likeCount = await postLikeRepository.countByPost(post.id);
    const commentCount = await commentRepository.listByPostId(post.id).then(c => c.length);

    return this.mapPostToDTO(post, likeCount, commentCount, false);
  },
};
```

### 4. API Routes (`src/app/api/`)

**Purpose:** Handle HTTP requests and responses

**Responsibilities:**
- Parse and validate request input (with Zod)
- Authenticate/authorize requests
- Call service layer
- Map domain errors to HTTP status codes
- Format responses

**Example:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const post = await postService.createPost({
      userId: user.id,
      ...parsed.data,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    // Handle unexpected errors
  }
}
```

## 🚦 Error Handling

### Domain Errors

Custom `DomainError` class for business logic violations:

```typescript
// In service layer
throw DomainError.notFound("Post", postId);
throw DomainError.unauthorized("Invalid credentials");
throw DomainError.conflict("Email is already registered");
throw DomainError.validation("Content cannot be empty");

// In API route
if (error instanceof DomainError) {
  return NextResponse.json(
    { message: error.message },
    { status: error.statusCode }
  );
}
```

## 🔐 Authentication

### Middleware Functions

Located in `src/shared/middleware/auth.ts`:

```typescript
// Optional authentication - returns user or null
const user = await authenticateRequest(request);

// Required authentication - throws error if not authenticated
const user = await requireAuth(request);
```

## 📊 DTOs (Data Transfer Objects)

Services return DTOs that are optimized for API responses:

```typescript
export interface PostDTO {
  id: string;
  content: string;
  imageUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  likeCount: number;
  commentCount: number;
  hasUserLiked: boolean;
}
```

## ✅ Best Practices

### DO ✅

- **API routes** should only handle HTTP concerns (parsing, auth, response formatting)
- **Services** should contain all business logic
- **Repositories** should be thin wrappers around database queries
- Use **dependency injection ready** patterns (pass repositories to services if needed)
- Keep **types explicit** across all layers
- Use **DomainError** for business rule violations
- **Validate input** at the API boundary with Zod schemas

### DON'T ❌

- **Don't** put business logic in API routes
- **Don't** import repositories directly in API routes (use services)
- **Don't** put business logic in repositories
- **Don't** import services in repositories (creates circular dependency)
- **Don't** use `any` types
- **Don't** catch and swallow errors silently

## 🔧 Adding New Features

### 1. Define Database Schema
Add to `src/db/schema/`

### 2. Create Repository
Add to `src/repositories/`
```typescript
export const featureRepository = {
  async findById(id: string) { ... },
  async create(payload: CreateInput) { ... },
};
```

### 3. Create Service
Add to `src/services/`
```typescript
export const featureService = {
  async createFeature(input: CreateInput) {
    // Business logic here
    const result = await featureRepository.create(input);
    return this.mapToDTO(result);
  },
};
```

### 4. Create API Route
Add to `src/app/api/`
```typescript
export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  const data = await featureService.createFeature({ ...input, userId: user.id });
  return NextResponse.json(data, { status: 201 });
}
```

## 📚 Key Files

| File | Purpose |
|------|---------|
| `src/database/client.ts` | Database client singleton |
| `src/shared/errors/domain-error.ts` | Custom error class |
| `src/shared/middleware/auth.ts` | Authentication helpers |
| `src/repositories/index.ts` | Repository exports |
| `src/services/index.ts` | Service exports |

## 🧪 Testing Strategy

- **Repository Layer:** Integration tests with test database
- **Service Layer:** Unit tests with mocked repositories
- **API Routes:** Contract tests with mocked services
- **E2E Tests:** Full stack tests for critical flows

## 📝 Migration Notes

- Old `src/lib/db.ts` now exports from `src/database/client.ts` for backward compatibility
- All API routes refactored to use service layer
- Direct database access removed from API routes
- Authentication logic centralized in middleware

## 🎯 Future Improvements

- [ ] Add caching layer (Redis)
- [ ] Implement pagination utilities
- [ ] Add transaction support helpers
- [ ] Create repository base class
- [ ] Add API versioning
- [ ] Implement audit logging
- [ ] Add rate limiting
- [ ] Create OpenAPI documentation

---

**For more details, see:** `LAYERED_ARCHITECTURE_GUIDE.md`

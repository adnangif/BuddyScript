# Redis Caching Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUESTS                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                            │
│                  /api/posts (GET, POST)                          │
│               /api/posts/[id]/likes (POST)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Post Service (post.service.ts)                          │   │
│  │  • listPosts()    → Cache-Aside Pattern                  │   │
│  │  • getPostById()  → Cache-Aside Pattern                  │   │
│  │  • createPost()   → Invalidate Feeds                     │   │
│  │  • deletePost()   → Invalidate Post + Feeds              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Like Service (postLike.service.ts)                      │   │
│  │  • likePost()     → Invalidate Like Count                │   │
│  │  • unlikePost()   → Invalidate Like Count                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Comment Service (comment.service.ts)                    │   │
│  │  • createComment() → Invalidate Comment Count            │   │
│  │  • deleteComment() → Invalidate Comment Count            │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────┬───────────────────┘
                 │                            │
                 │                            │
      ┌──────────▼───────────┐    ┌──────────▼──────────┐
      │   Cache Service      │    │   Data Repositories │
      │ (cache.service.ts)   │    │   - postRepository  │
      │                      │    │   - likeRepository  │
      │ • get()              │    │   - commentRepo     │
      │ • set()              │    │                     │
      │ • del()              │    └──────────┬──────────┘
      │ • delPattern()       │               │
      │ • getOrSet()         │               │
      └──────────┬───────────┘               │
                 │                            │
                 │                            │
      ┌──────────▼───────────┐    ┌──────────▼──────────┐
      │   Redis Client       │    │  Neon PostgreSQL    │
      │   (redis.ts)         │    │    Database         │
      │                      │    │                     │
      │ • Singleton pattern  │    │ • Persistent        │
      │ • Auto-reconnect     │    │ • Source of truth   │
      │ • TLS connection     │    │ • Drizzle ORM       │
      └──────────┬───────────┘    └─────────────────────┘
                 │
                 │
      ┌──────────▼───────────┐
      │   Upstash Redis      │
      │                      │
      │ • Global replication │
      │ • < 10ms latency     │
      │ • Pay-per-request    │
      │ • TLS encrypted      │
      └──────────────────────┘
```

## Cache Flow Diagrams

### Read Flow (Cache Hit)

```
Client Request
      │
      ▼
API Route
      │
      ▼
Service Layer
      │
      ├─→ Check Cache ──→ CACHE HIT ✅
      │                        │
      │                        ▼
      │                Return Cached Data
      │                        │
      ▼                        ▼
Response to Client (< 10ms)
```

### Read Flow (Cache Miss)

```
Client Request
      │
      ▼
API Route
      │
      ▼
Service Layer
      │
      ├─→ Check Cache ──→ CACHE MISS ❌
      │                        │
      │                        ▼
      │                Query Database
      │                        │
      │                        ▼
      │                Get Data from DB
      │                        │
      │                        ├─→ Store in Cache
      │                        │
      │                        ▼
      │                Return Fresh Data
      │                        │
      ▼                        ▼
Response to Client (100-300ms)
```

### Write Flow (with Invalidation)

```
Client Request (Create/Update/Delete)
      │
      ▼
API Route
      │
      ▼
Service Layer
      │
      ├─→ Update Database
      │         │
      │         ▼
      │   Database Updated
      │         │
      │         ├─→ Invalidate Related Caches
      │         │        │
      │         │        ├─→ Delete post:* keys
      │         │        ├─→ Delete posts:feed:* keys
      │         │        └─→ Delete count keys
      │         │
      ▼         ▼
Response to Client
```

## Cache Key Structure

```
Redis Keys Hierarchy:

├── post:{postId}                          (Individual post data)
│   ├── TTL: 600s (10 minutes)
│   └── Invalidated on: post update/delete
│
├── posts:feed:{userId}:{cursor}:{limit}   (Paginated feeds)
│   ├── TTL: 300s (5 minutes)
│   └── Invalidated on: post create/delete
│
├── post:{postId}:likes:count              (Like counts)
│   ├── TTL: 120s (2 minutes)
│   └── Invalidated on: like/unlike
│
└── post:{postId}:comments:count           (Comment counts)
    ├── TTL: 120s (2 minutes)
    └── Invalidated on: comment add/delete
```

## Data Flow Example: Loading Post Feed

```
1. User requests feed
   GET /api/posts?limit=10

2. API Route calls postService.listPosts()

3. Service checks cache:
   Key: posts:feed:user123:start:10
   
   ┌─── Cache Hit ────────────────┐
   │                              │
   │ Return cached data           │
   │ Response time: < 10ms        │
   │ Database queries: 0          │
   └──────────────────────────────┘
   
   ┌─── Cache Miss ───────────────┐
   │                              │
   │ 1. Query database (10 posts) │
   │ 2. For each post:            │
   │    - Get like count (cache)  │
   │    - Get comment count (cache)│
   │    - Check user liked        │
   │ 3. Cache result              │
   │ 4. Return data               │
   │                              │
   │ Response time: 100-300ms     │
   │ Database queries: 1-30       │
   └──────────────────────────────┘

4. Response sent to client
```

## Invalidation Strategy Flow

```
Event: User creates a new post
      │
      ▼
postService.createPost()
      │
      ├─→ Insert into database
      │
      ├─→ Fetch created post data
      │
      └─→ invalidateFeedCaches()
            │
            └─→ Delete pattern: posts:feed:*
                  │
                  ├─→ SCAN for matching keys
                  ├─→ Delete all feed caches
                  └─→ Log: "Invalidated N feed entries"

Next feed request will:
  • Find cache miss
  • Fetch fresh data (includes new post)
  • Rebuild cache
```

## Performance Comparison

```
WITHOUT CACHING:
─────────────────
Client ──→ API ──→ Service ──→ Database (4 queries per post)
                                    ↓
Time: 100-500ms per request        Load: HIGH
Scalability: Limited by DB         Cost: HIGH


WITH CACHING:
─────────────
Client ──→ API ──→ Service ──→ Redis (1 query)
                        ↓
                   Cache Hit: < 10ms
                   
Client ──→ API ──→ Service ──→ Database (on miss)
                        ↓
                   Redis (cache result)
                   
Time: < 10ms (hit), 100-300ms (miss)
Scalability: Redis handles millions of requests
Cost: LOW (pay-per-request with Upstash)
Cache Hit Rate: 85-95%
```

## Technology Stack Diagram

```
┌─────────────────────────────────────────────┐
│           Frontend (Next.js)                │
│   React Query + Zustand                     │
└─────────────────┬───────────────────────────┘
                  │ HTTP/JSON
                  ▼
┌─────────────────────────────────────────────┐
│       Backend (Next.js API Routes)          │
│   TypeScript + Zod Validation               │
└─────────┬──────────────┬────────────────────┘
          │              │
          │              │
┌─────────▼──────┐  ┌───▼────────────────────┐
│  Upstash Redis │  │  Neon PostgreSQL       │
│                │  │                        │
│  • ioredis     │  │  • Drizzle ORM         │
│  • TLS         │  │  • Connection Pool     │
│  • Serverless  │  │  • ACID transactions   │
└────────────────┘  └────────────────────────┘
```

## Monitoring & Observability

```
┌──────────────────────────────────────────────────┐
│              Application Logs                    │
│  • ✅ Cache HIT (posts:feed:user123)            │
│  • ❌ Cache MISS (post:abc123)                  │
│  • 🗑️ Invalidated 47 feed cache entries         │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│            Upstash Dashboard                     │
│  • Request count per second                      │
│  • Cache hit/miss rates                          │
│  • Memory usage                                  │
│  • Latency distribution                          │
│  • Error rates                                   │
└──────────────────────────────────────────────────┘
```

## Scaling Strategy

```
Current: Single Redis Instance
───────────────────────────────
[App Server 1] ──┐
[App Server 2] ──┼──→ [Upstash Redis] (Global Replication)
[App Server N] ──┘

Capacity: Millions of reads/day
Latency: < 10ms globally


Future: Edge Caching (if needed)
────────────────────────────────
[Client] ──→ [CDN Edge] ──→ [App Server] ──→ [Redis] ──→ [Database]
              (Static)        (Dynamic)       (Cache)    (Source)

Capacity: Billions of reads/day
Latency: < 5ms from edge
```

---

**Legend:**
- ✅ Cache Hit
- ❌ Cache Miss
- 🗑️ Cache Invalidation
- ──→ Data Flow
- ┌──┐ Component/Service

# BuddyScript API Documentation

## Overview

The BuddyScript API provides a comprehensive set of endpoints for a social media application, including user authentication, posts, comments, likes, and image uploads.

## Accessing the Documentation

### Development
When running the development server:
```bash
pnpm dev
```

Access the interactive Swagger UI documentation at:
- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI JSON Spec**: http://localhost:3000/api/docs

### Production
The same endpoints are available in production at your deployed URL.

## Authentication

Most endpoints require authentication using JWT tokens. After logging in or registering, you'll receive a JWT token.

### Using Authentication in Swagger UI

1. Navigate to http://localhost:3000/docs
2. Click the "Authorize" button (lock icon) at the top
3. Enter your token in the format: `Bearer YOUR_TOKEN_HERE`
4. Click "Authorize"
5. Now you can test authenticated endpoints

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Posts
- `GET /api/posts` - Get paginated list of posts (optional auth)
- `POST /api/posts` - Create a new post (requires auth)

### Comments
- `GET /api/posts/{postId}/comments` - Get comments for a post
- `POST /api/posts/{postId}/comments` - Create a comment (requires auth)
- `GET /api/comments/{commentId}/replies` - Get replies to a comment

### Likes
- `POST /api/posts/{postId}/likes` - Like a post (requires auth)
- `DELETE /api/posts/{postId}/likes` - Unlike a post (requires auth)
- `POST /api/comments/{commentId}/likes` - Like a comment (requires auth)
- `DELETE /api/comments/{commentId}/likes` - Unlike a comment (requires auth)

### Upload
- `POST /api/upload-image` - Upload an image file

## API Features

### Pagination
The posts endpoint supports cursor-based pagination:
- `cursor` - UUID of the last post from the previous page
- `limit` - Number of posts to return (1-50, default: 10)

### Response Format
All responses are in JSON format with appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

### Validation Errors
Validation errors are returned in a structured format:
```json
{
  "errors": {
    "fieldName": ["Error message 1", "Error message 2"]
  }
}
```

## Testing the API

### Using Swagger UI (Recommended)
The Swagger UI provides an interactive interface to test all endpoints directly from your browser.

### Using curl
```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Create a post (with token)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "Hello World!",
    "isPublic": true
  }'
```

## Schema Definitions

### User
```typescript
{
  id: string (uuid)
  firstName: string
  lastName: string
  email: string (email format)
  createdAt: string (date-time)
}
```

### Post
```typescript
{
  id: string (uuid)
  content: string (max 500 chars)
  imageUrl?: string (uri)
  isPublic: boolean
  userId: string (uuid)
  user: User
  likesCount: number
  commentsCount: number
  isLikedByUser: boolean
  createdAt: string (date-time)
}
```

### Comment
```typescript
{
  id: string (uuid)
  content: string (max 1000 chars)
  userId: string (uuid)
  postId: string (uuid)
  parentCommentId?: string (uuid)
  user: User
  likesCount: number
  repliesCount: number
  isLikedByUser: boolean
  createdAt: string (date-time)
}
```

## Rate Limiting

Currently, there are no rate limits enforced. This may change in production.

## Environment Variables

Make sure the following environment variables are configured:
- `NEXT_PUBLIC_API_BASE_URL` - Base URL for the API (defaults to http://localhost:3000/api)
- `IMGBB_API_KEY` - API key for image uploads

## Support

For issues or questions, please refer to the main README or create an issue in the repository.

## Known Issues

### React Lifecycle Warnings
The Swagger UI component (`swagger-ui-react`) uses deprecated React lifecycle methods that are not compatible with React 19. These console warnings have been suppressed in the code as they come from the third-party library and do not affect functionality. This is a [known issue](https://github.com/swagger-api/swagger-ui/issues/9466) with swagger-ui-react.

The warnings are cosmetic and do not impact:
- Application functionality
- Documentation features
- API endpoint testing
- Production builds

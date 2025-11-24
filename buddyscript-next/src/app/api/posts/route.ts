import { NextRequest, NextResponse } from "next/server";
import { createPostSchema } from "@/lib/validators/posts";
import { postService } from "@/services/post.service";
import { requireAuth } from "@/shared/middleware/auth";
import { DomainError } from "@/shared/errors/domain-error";

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get list of posts
 *     description: Retrieve a paginated list of posts. Authentication is required - the user must provide a valid Bearer token. Responses include like status for the authenticated user.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cursor for pagination (post ID to start from)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of posts to return (1-50)
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 nextCursor:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                   description: Cursor for next page
 *                 hasMore:
 *                   type: boolean
 *                   description: Whether more posts are available
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    // Require a valid authenticated user
    const user = await requireAuth(request);

    // Extract pagination params from query string
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor') || null;
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!, 10) 
      : 10;

    // Validate limit
    const validLimit = Math.min(Math.max(limit, 1), 50); // Between 1 and 50

    const result = await postService.listPosts({
  userId: user.id,
      cursor,
      limit: validLimit,
    });

    return NextResponse.json({
      posts: result.data,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to load posts", error);
    return NextResponse.json(
      { message: "Unable to load posts" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post with optional image. Requires authentication.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Post content
 *                 example: This is my first post!
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 description: Optional image URL
 *                 example: https://example.com/image.jpg
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the post is public
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid or missing JSON body" },
        { status: 400 },
      );
    }

    const parsed = createPostSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const post = await postService.createPost({
      userId: user.id,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl,
      isPublic: parsed.data.isPublic,
    });

    return NextResponse.json(
      {
        post,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to create post", error);
    return NextResponse.json(
      { message: "Unable to create post" },
      { status: 500 },
    );
  }
}



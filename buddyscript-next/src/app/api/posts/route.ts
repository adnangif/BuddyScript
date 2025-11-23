import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { comments, postLikes, posts, users } from "@/db/schema";
import { db } from "@/lib/db";
import { verifyAuthToken } from "@/lib/jwt";
import { createPostSchema } from "@/lib/validators/posts";

const mapPost = async (row: {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  authorId: string;
  authorFirstName: string;
  authorLastName: string;
}, userId?: string) => {
  // Get like count
  const likeCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postLikes)
    .where(eq(postLikes.postId, row.id));

  // Get comment count
  const commentCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(comments)
    .where(eq(comments.postId, row.id));

  // Check if user has liked this post
  let hasUserLiked = false;
  if (userId) {
    const userLike = await db.query.postLikes.findFirst({
      where: and(eq(postLikes.postId, row.id), eq(postLikes.userId, userId)),
    });
    hasUserLiked = !!userLike;
  }

  return {
    id: row.id,
    content: row.content,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt.toISOString(),
    author: {
      id: row.authorId,
      firstName: row.authorFirstName,
      lastName: row.authorLastName,
    },
    likeCount: likeCountResult[0]?.count ?? 0,
    commentCount: commentCountResult[0]?.count ?? 0,
    hasUserLiked,
  };
};

const authenticateRequest = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });
    return user ?? null;
  } catch {
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get user from token if available
    const authHeader = request.headers.get("authorization");
    let userId: string | undefined;

    if (authHeader) {
      const [scheme, token] = authHeader.split(" ");
      if (scheme?.toLowerCase() === "bearer" && token) {
        try {
          const payload = verifyAuthToken(token);
          const user = await db.query.users.findFirst({
            where: eq(users.id, payload.sub),
          });
          userId = user?.id;
        } catch {
          // Token invalid, continue without user
        }
      }
    }

    const rows = await db
      .select({
        id: posts.id,
        content: posts.content,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        authorId: users.id,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    const mappedPosts = await Promise.all(
      rows.map(row => mapPost(row, userId))
    );

    return NextResponse.json({
      posts: mappedPosts,
    });
  } catch (error) {
    console.error("Failed to load posts", error);
    return NextResponse.json(
      { message: "Unable to load posts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);

  if (!user) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 },
    );
  }

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

  try {
    const [createdPost] = await db
      .insert(posts)
      .values({
        userId: user.id,
        content: parsed.data.content.trim(),
        imageUrl: parsed.data.imageUrl ?? null,
      })
      .returning();

    const createdAt = createdPost.createdAt ?? new Date();

    const mappedPost = await mapPost({
      id: createdPost.id,
      content: createdPost.content,
      imageUrl: createdPost.imageUrl,
      createdAt,
      authorId: user.id,
      authorFirstName: user.firstName,
      authorLastName: user.lastName,
    }, user.id);

    return NextResponse.json(
      {
        post: mappedPost,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create post", error);
    return NextResponse.json(
      { message: "Unable to create post" },
      { status: 500 },
    );
  }
}



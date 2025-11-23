import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { posts, users } from "@/db/schema";
import { db } from "@/lib/db";
import { verifyAuthToken } from "@/lib/jwt";
import { createPostSchema } from "@/lib/validators/posts";

const mapPost = (row: {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  authorId: string;
  authorFirstName: string;
  authorLastName: string;
}) => ({
  id: row.id,
  content: row.content,
  imageUrl: row.imageUrl,
  createdAt: row.createdAt.toISOString(),
  author: {
    id: row.authorId,
    firstName: row.authorFirstName,
    lastName: row.authorLastName,
  },
});

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

export async function GET() {
  try {
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

    return NextResponse.json({
      posts: rows.map(mapPost),
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

    return NextResponse.json(
      {
        post: mapPost({
          id: createdPost.id,
          content: createdPost.content,
          imageUrl: createdPost.imageUrl,
          createdAt,
          authorId: user.id,
          authorFirstName: user.firstName,
          authorLastName: user.lastName,
        }),
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



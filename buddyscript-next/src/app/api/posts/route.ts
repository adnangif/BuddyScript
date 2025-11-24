import { NextRequest, NextResponse } from "next/server";
import { createPostSchema } from "@/lib/validators/posts";
import { postService } from "@/services/post.service";
import { authenticateRequest, requireAuth } from "@/shared/middleware/auth";
import { DomainError } from "@/shared/errors/domain-error";

export async function GET(request: NextRequest) {
  try {
    // Get user from token if available
    const user = await authenticateRequest(request);

    const posts = await postService.listPosts({
      userId: user?.id,
    });

    return NextResponse.json({
      posts,
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



import { NextRequest, NextResponse } from "next/server";
import { createCommentSchema } from "@/lib/validators/comments";
import { commentService } from "@/services/comment.service";
import { authenticateRequest, requireAuth } from "@/shared/middleware/auth";
import { DomainError } from "@/shared/errors/domain-error";

// GET: Fetch all comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const user = await authenticateRequest(request);

    const comments = await commentService.listCommentsByPost(postId, {
      userId: user?.id,
    });

    return NextResponse.json({
      comments,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to load comments", error);
    return NextResponse.json(
      { message: "Unable to load comments" },
      { status: 500 }
    );
  }
}

// POST: Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { postId } = await params;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid or missing JSON body" },
        { status: 400 }
      );
    }

    const parsed = createCommentSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const comment = await commentService.createComment({
      postId,
      userId: user.id,
      content: parsed.data.content,
      parentCommentId: parsed.data.parentCommentId,
    });

    return NextResponse.json(
      {
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to create comment", error);
    return NextResponse.json(
      { message: "Unable to create comment" },
      { status: 500 }
    );
  }
}

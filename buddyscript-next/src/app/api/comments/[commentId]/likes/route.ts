import { NextRequest, NextResponse } from "next/server";
import { commentLikeService } from "@/services/commentLike.service";
import { requireAuth } from "@/shared/middleware/auth";
import { DomainError } from "@/shared/errors/domain-error";

// POST: Like a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { commentId } = await params;

    const result = await commentLikeService.likeComment(user.id, commentId);

    return NextResponse.json(result, { status: result.message ? 200 : 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to like comment", error);
    return NextResponse.json(
      { message: "Unable to like comment" },
      { status: 500 }
    );
  }
}

// DELETE: Unlike a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { commentId } = await params;

    const result = await commentLikeService.unlikeComment(user.id, commentId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to unlike comment", error);
    return NextResponse.json(
      { message: "Unable to unlike comment" },
      { status: 500 }
    );
  }
}

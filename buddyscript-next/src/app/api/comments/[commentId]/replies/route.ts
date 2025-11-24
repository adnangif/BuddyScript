import { NextRequest, NextResponse } from "next/server";
import { commentService } from "@/services/comment.service";
import { authenticateRequest } from "@/shared/middleware/auth";
import { DomainError } from "@/shared/errors/domain-error";

// GET: Fetch all replies for a comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const user = await authenticateRequest(request);

    // Get the parent comment to find its postId
    const parentComment = await commentService.getCommentById(
      commentId,
      user?.id
    );

    // Fetch replies
    const replies = await commentService.listCommentsByPost(
      parentComment.postId,
      {
        userId: user?.id,
        parentCommentId: commentId,
      }
    );

    return NextResponse.json({
      replies,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to load replies", error);
    return NextResponse.json(
      { message: "Unable to load replies" },
      { status: 500 }
    );
  }
}

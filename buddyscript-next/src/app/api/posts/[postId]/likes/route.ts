import { NextRequest, NextResponse } from "next/server";
import { postLikeService } from "@/services/postLike.service";
import { requireAuth } from "@/shared/middleware/auth";
import { DomainError } from "@/shared/errors/domain-error";

// POST: Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { postId } = await params;

    const result = await postLikeService.likePost(user.id, postId);

    return NextResponse.json(result, { status: result.message ? 200 : 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to like post", error);
    return NextResponse.json(
      { message: "Unable to like post" },
      { status: 500 }
    );
  }
}

// DELETE: Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { postId } = await params;

    const result = await postLikeService.unlikePost(user.id, postId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Failed to unlike post", error);
    return NextResponse.json(
      { message: "Unable to unlike post" },
      { status: 500 }
    );
  }
}

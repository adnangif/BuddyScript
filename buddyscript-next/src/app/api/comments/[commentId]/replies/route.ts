import { NextRequest, NextResponse } from "next/server";
import { commentService } from "@/services/comment.service";
import { authenticateRequest } from "@/shared/middleware/auth";
import { DomainError } from "@/shared/errors/domain-error";

/**
 * @swagger
 * /comments/{commentId}/replies:
 *   get:
 *     summary: Get replies to a comment
 *     description: Retrieve all replies for a specific comment. Authentication is optional.
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Parent comment ID
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 replies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
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

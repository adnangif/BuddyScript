import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql, and } from "drizzle-orm";

import { commentLikes, comments, users } from "@/db/schema";
import { db } from "@/lib/db";
import { verifyAuthToken } from "@/lib/jwt";

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

const mapComment = async (row: {
    id: string;
    postId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    parentCommentId: string | null;
    authorId: string;
    authorFirstName: string;
    authorLastName: string;
}, userId?: string) => {
    // Get like count
    const likeCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(commentLikes)
        .where(eq(commentLikes.commentId, row.id));

    // Get reply count
    const replyCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(comments)
        .where(eq(comments.parentCommentId, row.id));

    // Check if user has liked this comment
    let hasUserLiked = false;
    if (userId) {
        const userLike = await db.query.commentLikes.findFirst({
            where: and(
                eq(commentLikes.commentId, row.id),
                eq(commentLikes.userId, userId)
            ),
        });
        hasUserLiked = !!userLike;
    }

    return {
        id: row.id,
        postId: row.postId,
        content: row.content,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        parentCommentId: row.parentCommentId,
        author: {
            id: row.authorId,
            firstName: row.authorFirstName,
            lastName: row.authorLastName,
        },
        likeCount: likeCountResult[0]?.count ?? 0,
        replyCount: replyCountResult[0]?.count ?? 0,
        hasUserLiked,
    };
};

// GET: Fetch all replies for a comment
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) {
    const { commentId } = await params;

    // Get user from token if available
    const user = await authenticateRequest(request);

    // Check if comment exists
    const comment = await db.query.comments.findFirst({
        where: eq(comments.id, commentId),
    });

    if (!comment) {
        return NextResponse.json(
            { message: "Comment not found" },
            { status: 404 }
        );
    }

    try {
        // Fetch all replies to this comment
        const rows = await db
            .select({
                id: comments.id,
                postId: comments.postId,
                content: comments.content,
                createdAt: comments.createdAt,
                updatedAt: comments.updatedAt,
                parentCommentId: comments.parentCommentId,
                authorId: users.id,
                authorFirstName: users.firstName,
                authorLastName: users.lastName,
            })
            .from(comments)
            .innerJoin(users, eq(comments.userId, users.id))
            .where(eq(comments.parentCommentId, commentId))
            .orderBy(desc(comments.createdAt));

        const mappedReplies = await Promise.all(
            rows.map(row => mapComment(row, user?.id))
        );

        return NextResponse.json({
            replies: mappedReplies,
        });
    } catch (error) {
        console.error("Failed to load replies", error);
        return NextResponse.json(
            { message: "Unable to load replies" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";

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

// POST: Like a comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) {
    const user = await authenticateRequest(request);

    if (!user) {
        return NextResponse.json(
            { message: "Authentication required" },
            { status: 401 }
        );
    }

    const { commentId } = await params;

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
        // Check if user already liked this comment
        const existingLike = await db.query.commentLikes.findFirst({
            where: and(
                eq(commentLikes.commentId, commentId),
                eq(commentLikes.userId, user.id)
            ),
        });

        if (existingLike) {
            // Get current like count
            const likeCountResult = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(commentLikes)
                .where(eq(commentLikes.commentId, commentId));

            return NextResponse.json({
                success: true,
                likeCount: likeCountResult[0]?.count ?? 0,
                message: "Already liked",
            });
        }

        // Create new like
        await db.insert(commentLikes).values({
            commentId,
            userId: user.id,
        });

        // Get updated like count
        const likeCountResult = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(commentLikes)
            .where(eq(commentLikes.commentId, commentId));

        return NextResponse.json(
            {
                success: true,
                likeCount: likeCountResult[0]?.count ?? 0,
            },
            { status: 201 }
        );
    } catch (error) {
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
    const user = await authenticateRequest(request);

    if (!user) {
        return NextResponse.json(
            { message: "Authentication required" },
            { status: 401 }
        );
    }

    const { commentId } = await params;

    try {
        // Delete the like
        await db
            .delete(commentLikes)
            .where(
                and(
                    eq(commentLikes.commentId, commentId),
                    eq(commentLikes.userId, user.id)
                )
            );

        // Get updated like count
        const likeCountResult = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(commentLikes)
            .where(eq(commentLikes.commentId, commentId));

        return NextResponse.json({
            success: true,
            likeCount: likeCountResult[0]?.count ?? 0,
        });
    } catch (error) {
        console.error("Failed to unlike comment", error);
        return NextResponse.json(
            { message: "Unable to unlike comment" },
            { status: 500 }
        );
    }
}

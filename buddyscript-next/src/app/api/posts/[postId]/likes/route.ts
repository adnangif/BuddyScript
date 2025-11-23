import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { postLikes, posts, users } from "@/db/schema";
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

// POST: Like a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const user = await authenticateRequest(request);

    if (!user) {
        return NextResponse.json(
            { message: "Authentication required" },
            { status: 401 }
        );
    }

    const { postId } = await params;

    // Check if post exists
    const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
    });

    if (!post) {
        return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    try {
        // Check if user already liked this post
        const existingLike = await db.query.postLikes.findFirst({
            where: and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)),
        });

        if (existingLike) {
            // Get current like count
            const likeCountResult = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(postLikes)
                .where(eq(postLikes.postId, postId));

            return NextResponse.json({
                success: true,
                likeCount: likeCountResult[0]?.count ?? 0,
                message: "Already liked",
            });
        }

        // Create new like
        await db.insert(postLikes).values({
            postId,
            userId: user.id,
        });

        // Get updated like count
        const likeCountResult = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(postLikes)
            .where(eq(postLikes.postId, postId));

        return NextResponse.json(
            {
                success: true,
                likeCount: likeCountResult[0]?.count ?? 0,
            },
            { status: 201 }
        );
    } catch (error) {
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
    const user = await authenticateRequest(request);

    if (!user) {
        return NextResponse.json(
            { message: "Authentication required" },
            { status: 401 }
        );
    }

    const { postId } = await params;

    try {
        // Delete the like
        await db
            .delete(postLikes)
            .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)));

        // Get updated like count
        const likeCountResult = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(postLikes)
            .where(eq(postLikes.postId, postId));

        return NextResponse.json({
            success: true,
            likeCount: likeCountResult[0]?.count ?? 0,
        });
    } catch (error) {
        console.error("Failed to unlike post", error);
        return NextResponse.json(
            { message: "Unable to unlike post" },
            { status: 500 }
        );
    }
}

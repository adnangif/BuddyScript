import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { commentLikes, comments, posts, users } from "@/db/schema";
import { db } from "@/lib/db";
import { verifyAuthToken } from "@/lib/jwt";
import { createCommentSchema } from "@/lib/validators/comments";

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

// GET: Fetch all comments for a post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;

    // Get user from token if available
    const user = await authenticateRequest(request);

    // Check if post exists
    const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
    });

    if (!post) {
        return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    try {
        // Fetch all top-level comments (no parent)
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
            .where(and(
                eq(comments.postId, postId),
                isNull(comments.parentCommentId)
            ))
            .orderBy(desc(comments.createdAt));

        const mappedComments = await Promise.all(
            rows.map(row => mapComment(row, user?.id))
        );

        return NextResponse.json({
            comments: mappedComments,
        });
    } catch (error) {
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

    // If parentCommentId is provided, verify it exists and belongs to this post
    if (parsed.data.parentCommentId) {
        const parentComment = await db.query.comments.findFirst({
            where: and(
                eq(comments.id, parsed.data.parentCommentId),
                eq(comments.postId, postId)
            ),
        });

        if (!parentComment) {
            return NextResponse.json(
                { message: "Parent comment not found" },
                { status: 404 }
            );
        }
    }

    try {
        const [createdComment] = await db
            .insert(comments)
            .values({
                postId,
                userId: user.id,
                content: parsed.data.content.trim(),
                parentCommentId: parsed.data.parentCommentId ?? null,
            })
            .returning();

        const createdAt = createdComment.createdAt ?? new Date();
        const updatedAt = createdComment.updatedAt ?? new Date();

        const mappedComment = await mapComment({
            id: createdComment.id,
            postId: createdComment.postId,
            content: createdComment.content,
            createdAt,
            updatedAt,
            parentCommentId: createdComment.parentCommentId,
            authorId: user.id,
            authorFirstName: user.firstName,
            authorLastName: user.lastName,
        }, user.id);

        return NextResponse.json(
            {
                comment: mappedComment,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Failed to create comment", error);
        return NextResponse.json(
            { message: "Unable to create comment" },
            { status: 500 }
        );
    }
}

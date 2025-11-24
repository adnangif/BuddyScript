import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { dbClient } from "@/database/client";
import { comments, users } from "@/db/schema";

export interface CommentRecord {
    id: string;
    postId: string;
    userId: string;
    content: string;
    parentCommentId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CommentWithAuthor extends CommentRecord {
    author: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export const commentRepository = {
    async findById(commentId: string): Promise<CommentRecord | null> {
        const comment = await dbClient.query.comments.findFirst({
            where: eq(comments.id, commentId),
        });
        return comment ?? null;
    },

    async findByIdWithAuthor(
        commentId: string
    ): Promise<CommentWithAuthor | null> {
        const rows = await dbClient
            .select({
                id: comments.id,
                postId: comments.postId,
                userId: comments.userId,
                content: comments.content,
                parentCommentId: comments.parentCommentId,
                createdAt: comments.createdAt,
                updatedAt: comments.updatedAt,
                authorId: users.id,
                authorFirstName: users.firstName,
                authorLastName: users.lastName,
            })
            .from(comments)
            .innerJoin(users, eq(comments.userId, users.id))
            .where(eq(comments.id, commentId))
            .limit(1);

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            id: row.id,
            postId: row.postId,
            userId: row.userId,
            content: row.content,
            parentCommentId: row.parentCommentId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            author: {
                id: row.authorId,
                firstName: row.authorFirstName,
                lastName: row.authorLastName,
            },
        };
    },

    async listByPostId(
        postId: string,
        params: { parentCommentId?: string | null } = {}
    ): Promise<CommentWithAuthor[]> {
        const whereConditions = [eq(comments.postId, postId)];

        if (params.parentCommentId === null || params.parentCommentId === undefined) {
            // Get top-level comments only
            whereConditions.push(isNull(comments.parentCommentId));
        } else {
            // Get replies to a specific comment
            whereConditions.push(eq(comments.parentCommentId, params.parentCommentId));
        }

        const rows = await dbClient
            .select({
                id: comments.id,
                postId: comments.postId,
                userId: comments.userId,
                content: comments.content,
                parentCommentId: comments.parentCommentId,
                createdAt: comments.createdAt,
                updatedAt: comments.updatedAt,
                authorId: users.id,
                authorFirstName: users.firstName,
                authorLastName: users.lastName,
            })
            .from(comments)
            .innerJoin(users, eq(comments.userId, users.id))
            .where(and(...whereConditions))
            .orderBy(desc(comments.createdAt));

        return rows.map(row => ({
            id: row.id,
            postId: row.postId,
            userId: row.userId,
            content: row.content,
            parentCommentId: row.parentCommentId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            author: {
                id: row.authorId,
                firstName: row.authorFirstName,
                lastName: row.authorLastName,
            },
        }));
    },

    async countReplies(commentId: string): Promise<number> {
        const result = await dbClient
            .select({ count: sql<number>`count(*)::int` })
            .from(comments)
            .where(eq(comments.parentCommentId, commentId));

        return result[0]?.count ?? 0;
    },

    async create(payload: {
        postId: string;
        userId: string;
        content: string;
        parentCommentId?: string | null;
    }): Promise<CommentRecord> {
        const [createdComment] = await dbClient
            .insert(comments)
            .values({
                postId: payload.postId,
                userId: payload.userId,
                content: payload.content.trim(),
                parentCommentId: payload.parentCommentId ?? null,
            })
            .returning();

        return createdComment;
    },

    async delete(commentId: string): Promise<void> {
        await dbClient.delete(comments).where(eq(comments.id, commentId));
    },
};

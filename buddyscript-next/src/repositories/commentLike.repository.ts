import { and, eq, sql } from "drizzle-orm";
import { dbClient } from "@/database/client";
import { commentLikes } from "@/db/schema";

export interface CommentLikeRecord {
    id: string;
    commentId: string;
    userId: string;
    createdAt: Date;
}

export const commentLikeRepository = {
    async findByUserAndComment(
        userId: string,
        commentId: string
    ): Promise<CommentLikeRecord | null> {
        const like = await dbClient.query.commentLikes.findFirst({
            where: and(
                eq(commentLikes.commentId, commentId),
                eq(commentLikes.userId, userId)
            ),
        });
        return like ?? null;
    },

    async countByComment(commentId: string): Promise<number> {
        const result = await dbClient
            .select({ count: sql<number>`count(*)::int` })
            .from(commentLikes)
            .where(eq(commentLikes.commentId, commentId));

        return result[0]?.count ?? 0;
    },

    async create(payload: {
        commentId: string;
        userId: string;
    }): Promise<CommentLikeRecord> {
        const [createdLike] = await dbClient
            .insert(commentLikes)
            .values({
                commentId: payload.commentId,
                userId: payload.userId,
            })
            .returning();

        return createdLike;
    },

    async delete(userId: string, commentId: string): Promise<void> {
        await dbClient
            .delete(commentLikes)
            .where(
                and(
                    eq(commentLikes.commentId, commentId),
                    eq(commentLikes.userId, userId)
                )
            );
    },
};

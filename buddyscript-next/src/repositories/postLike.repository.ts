import { and, eq, sql } from "drizzle-orm";
import { dbClient } from "@/database/client";
import { postLikes } from "@/db/schema";

export interface PostLikeRecord {
    id: string;
    postId: string;
    userId: string;
    createdAt: Date;
}

export const postLikeRepository = {
    async findByUserAndPost(
        userId: string,
        postId: string
    ): Promise<PostLikeRecord | null> {
        const like = await dbClient.query.postLikes.findFirst({
            where: and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)),
        });
        return like ?? null;
    },

    async countByPost(postId: string): Promise<number> {
        const result = await dbClient
            .select({ count: sql<number>`count(*)::int` })
            .from(postLikes)
            .where(eq(postLikes.postId, postId));

        return result[0]?.count ?? 0;
    },

    async create(payload: {
        postId: string;
        userId: string;
    }): Promise<PostLikeRecord> {
        const [createdLike] = await dbClient
            .insert(postLikes)
            .values({
                postId: payload.postId,
                userId: payload.userId,
            })
            .returning();

        return createdLike;
    },

    async delete(userId: string, postId: string): Promise<void> {
        await dbClient
            .delete(postLikes)
            .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    },
};

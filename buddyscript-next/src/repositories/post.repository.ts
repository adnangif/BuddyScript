import { and, desc, eq, or, sql } from "drizzle-orm";
import { dbClient } from "@/database/client";
import { posts, users } from "@/db/schema";

export interface PostRecord {
    id: string;
    content: string;
    imageUrl: string | null;
    isPublic: boolean;
    createdAt: Date;
    userId: string;
}

export interface PostWithAuthor extends PostRecord {
    author: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export const postRepository = {
    async findById(postId: string): Promise<PostRecord | null> {
        const post = await dbClient.query.posts.findFirst({
            where: eq(posts.id, postId),
        });
        return post ?? null;
    },

    async findByIdWithAuthor(postId: string): Promise<PostWithAuthor | null> {
        const rows = await dbClient
            .select({
                id: posts.id,
                content: posts.content,
                imageUrl: posts.imageUrl,
                isPublic: posts.isPublic,
                createdAt: posts.createdAt,
                userId: posts.userId,
                authorId: users.id,
                authorFirstName: users.firstName,
                authorLastName: users.lastName,
            })
            .from(posts)
            .innerJoin(users, eq(posts.userId, users.id))
            .where(eq(posts.id, postId))
            .limit(1);

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            id: row.id,
            content: row.content,
            imageUrl: row.imageUrl,
            isPublic: row.isPublic,
            createdAt: row.createdAt,
            userId: row.userId,
            author: {
                id: row.authorId,
                firstName: row.authorFirstName,
                lastName: row.authorLastName,
            },
        };
    },

    async listWithAuthors(params: {
        userId?: string;
    }): Promise<PostWithAuthor[]> {
        // Build where clause: show public posts OR posts from the authenticated user
        let whereClause;
        if (params.userId) {
            whereClause = or(eq(posts.isPublic, true), eq(posts.userId, params.userId));
        } else {
            whereClause = eq(posts.isPublic, true);
        }

        const rows = await dbClient
            .select({
                id: posts.id,
                content: posts.content,
                imageUrl: posts.imageUrl,
                isPublic: posts.isPublic,
                createdAt: posts.createdAt,
                userId: posts.userId,
                authorId: users.id,
                authorFirstName: users.firstName,
                authorLastName: users.lastName,
            })
            .from(posts)
            .innerJoin(users, eq(posts.userId, users.id))
            .where(whereClause)
            .orderBy(desc(posts.createdAt));

        return rows.map(row => ({
            id: row.id,
            content: row.content,
            imageUrl: row.imageUrl,
            isPublic: row.isPublic,
            createdAt: row.createdAt,
            userId: row.userId,
            author: {
                id: row.authorId,
                firstName: row.authorFirstName,
                lastName: row.authorLastName,
            },
        }));
    },

    async create(payload: {
        userId: string;
        content: string;
        imageUrl?: string | null;
        isPublic?: boolean;
    }): Promise<PostRecord> {
        const [createdPost] = await dbClient
            .insert(posts)
            .values({
                userId: payload.userId,
                content: payload.content.trim(),
                imageUrl: payload.imageUrl ?? null,
                isPublic: payload.isPublic ?? true,
            })
            .returning();

        return createdPost;
    },

    async delete(postId: string): Promise<void> {
        await dbClient.delete(posts).where(eq(posts.id, postId));
    },
};

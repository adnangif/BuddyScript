import { and, desc, eq, lt, or, sql } from "drizzle-orm";
import { dbClient } from "@/database/client";
import { posts, users } from "@/db/schema";
import { CursorPaginatedResult } from "@/shared/types/pagination";

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
        cursor?: string | null;
        limit?: number;
    }): Promise<CursorPaginatedResult<PostWithAuthor>> {
        const limit = params.limit ?? 10; // Default to 10 posts per page
        
        // Build where clause: show public posts OR posts from the authenticated user
        let whereConditions = [];
        
        if (params.userId) {
            whereConditions.push(or(eq(posts.isPublic, true), eq(posts.userId, params.userId)));
        } else {
            whereConditions.push(eq(posts.isPublic, true));
        }

        // Add cursor condition if provided (cursor-based pagination)
        if (params.cursor) {
            whereConditions.push(lt(posts.createdAt, new Date(params.cursor)));
        }

        const whereClause = whereConditions.length > 1 
            ? and(...whereConditions) 
            : whereConditions[0];

        // Fetch limit + 1 to determine if there are more posts
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
            .orderBy(desc(posts.createdAt))
            .limit(limit + 1);

        const hasMore = rows.length > limit;
        const data = rows.slice(0, limit);
        const nextCursor = hasMore && data.length > 0 
            ? data[data.length - 1].createdAt.toISOString() 
            : null;

        return {
            data: data.map(row => ({
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
            })),
            nextCursor,
            hasMore,
        };
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

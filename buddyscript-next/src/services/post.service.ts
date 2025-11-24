import { postRepository, type PostWithAuthor } from "@/repositories/post.repository";
import { postLikeRepository } from "@/repositories/postLike.repository";
import { commentRepository } from "@/repositories/comment.repository";
import { DomainError } from "@/shared/errors/domain-error";
import { CursorPaginatedResult } from "@/shared/types/pagination";
import { cacheService, CacheKeys } from "./cache.service";

export interface CreatePostInput {
    userId: string;
    content: string;
    imageUrl?: string | null;
    isPublic?: boolean;
}

export interface PostDTO {
    id: string;
    content: string;
    imageUrl: string | null;
    isPublic: boolean;
    createdAt: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
    };
    likeCount: number;
    commentCount: number;
    hasUserLiked: boolean;
}

export const postService = {
    async createPost(input: CreatePostInput): Promise<PostDTO> {
        // Validate content
        if (!input.content.trim()) {
            throw DomainError.validation("Post content cannot be empty");
        }

        const createdPost = await postRepository.create({
            userId: input.userId,
            content: input.content,
            imageUrl: input.imageUrl,
            isPublic: input.isPublic,
        });

        // Fetch with author info
        const postWithAuthor = await postRepository.findByIdWithAuthor(
            createdPost.id
        );

        if (!postWithAuthor) {
            throw new Error("Failed to retrieve created post");
        }

        // Get counts
        const likeCount = await postLikeRepository.countByPost(createdPost.id);
        const commentCount = await commentRepository.listByPostId(createdPost.id).then(c => c.length);
        const hasUserLiked = !!(await postLikeRepository.findByUserAndPost(
            input.userId,
            createdPost.id
        ));

        const postDTO = this.mapPostToDTO(postWithAuthor, likeCount, commentCount, hasUserLiked);

        // Invalidate feed caches since a new post was created
        await this.invalidateFeedCaches(input.userId);

        return postDTO;
    },

    async listPosts(params: { 
        userId?: string;
        cursor?: string | null;
        limit?: number;
    }): Promise<CursorPaginatedResult<PostDTO>> {
        const limit = params.limit ?? 10;
        const cacheKey = CacheKeys.postsFeed(params.userId, params.cursor ?? null, limit);
        
        // Try to get from cache first
        const cached = await cacheService.get<CursorPaginatedResult<PostDTO>>(cacheKey);
        if (cached) {
            console.log(`✅ Cache HIT for posts feed: ${cacheKey}`);
            return cached;
        }

        console.log(`❌ Cache MISS for posts feed: ${cacheKey}`);

        // Fetch from database
        const postsResult = await postRepository.listWithAuthors({
            userId: params.userId,
            cursor: params.cursor,
            limit: params.limit,
        });

        // Enrich with counts and user-specific data
        const enrichedPosts = await Promise.all(
            postsResult.data.map(async (post) => {
                // Try to get counts from cache
                const likeCountKey = CacheKeys.postLikeCount(post.id);
                const commentCountKey = CacheKeys.postCommentCount(post.id);

                let likeCount = await cacheService.get<number>(likeCountKey);
                if (likeCount === null) {
                    likeCount = await postLikeRepository.countByPost(post.id);
                    // Cache for 2 minutes (counts change frequently)
                    await cacheService.set(likeCountKey, likeCount, 120);
                }

                let commentCount = await cacheService.get<number>(commentCountKey);
                if (commentCount === null) {
                    commentCount = await commentRepository.listByPostId(post.id).then(c => c.length);
                    // Cache for 2 minutes
                    await cacheService.set(commentCountKey, commentCount, 120);
                }

                const hasUserLiked = params.userId
                    ? !!(await postLikeRepository.findByUserAndPost(params.userId, post.id))
                    : false;

                return this.mapPostToDTO(post, likeCount ?? 0, commentCount ?? 0, hasUserLiked);
            })
        );

        const result = {
            data: enrichedPosts,
            nextCursor: postsResult.nextCursor,
            hasMore: postsResult.hasMore,
        };

        // Cache the result for 5 minutes
        await cacheService.set(cacheKey, result, 300);

        return result;
    },

    async getPostById(postId: string, userId?: string): Promise<PostDTO> {
        const cacheKey = CacheKeys.post(postId);

        // Try to get from cache first (but we need to check hasUserLiked separately)
        const cached = await cacheService.get<PostDTO>(cacheKey);
        if (cached && userId) {
            // Update hasUserLiked for the specific user
            const hasUserLiked = !!(await postLikeRepository.findByUserAndPost(userId, postId));
            if (cached.hasUserLiked !== hasUserLiked) {
                cached.hasUserLiked = hasUserLiked;
            }
            console.log(`✅ Cache HIT for post: ${cacheKey}`);
            return cached;
        } else if (cached && !userId) {
            console.log(`✅ Cache HIT for post: ${cacheKey}`);
            return cached;
        }

        console.log(`❌ Cache MISS for post: ${cacheKey}`);

        const post = await postRepository.findByIdWithAuthor(postId);

        if (!post) {
            throw DomainError.notFound("Post", postId);
        }

        // Get counts with caching
        const likeCountKey = CacheKeys.postLikeCount(postId);
        const commentCountKey = CacheKeys.postCommentCount(postId);

        let likeCount = await cacheService.get<number>(likeCountKey);
        if (likeCount === null) {
            likeCount = await postLikeRepository.countByPost(postId);
            await cacheService.set(likeCountKey, likeCount, 120);
        }

        let commentCount = await cacheService.get<number>(commentCountKey);
        if (commentCount === null) {
            commentCount = await commentRepository.listByPostId(postId).then(c => c.length);
            await cacheService.set(commentCountKey, commentCount, 120);
        }

        const hasUserLiked = userId
            ? !!(await postLikeRepository.findByUserAndPost(userId, postId))
            : false;

        const postDTO = this.mapPostToDTO(post, likeCount ?? 0, commentCount ?? 0, hasUserLiked);

        // Cache the post (10 minutes TTL for individual posts)
        await cacheService.set(cacheKey, postDTO, 600);

        return postDTO;
    },

    async deletePost(postId: string, userId: string): Promise<void> {
        const post = await postRepository.findById(postId);

        if (!post) {
            throw DomainError.notFound("Post", postId);
        }

        // Verify ownership
        if (post.userId !== userId) {
            throw DomainError.forbidden("You can only delete your own posts");
        }

        await postRepository.delete(postId);

        // Invalidate caches for this post
        await this.invalidatePostCaches(postId, userId);
    },

    /**
     * Invalidate all feed caches (called when a new post is created)
     */
    async invalidateFeedCaches(userId?: string): Promise<void> {
        try {
            // Invalidate all feed caches (both user-specific and public)
            const deletedCount = await cacheService.delPattern(CacheKeys.patterns.allFeeds);
            console.log(`🗑️  Invalidated ${deletedCount} feed cache entries`);
        } catch (error) {
            console.error("Failed to invalidate feed caches:", error);
        }
    },

    /**
     * Invalidate caches for a specific post (called when post is deleted or updated)
     */
    async invalidatePostCaches(postId: string, userId?: string): Promise<void> {
        try {
            // Invalidate specific post cache and its related data
            await cacheService.del(CacheKeys.post(postId));
            await cacheService.del(CacheKeys.postLikeCount(postId));
            await cacheService.del(CacheKeys.postCommentCount(postId));

            // Invalidate all feeds since the post list changed
            await this.invalidateFeedCaches(userId);

            console.log(`🗑️  Invalidated caches for post: ${postId}`);
        } catch (error) {
            console.error(`Failed to invalidate caches for post ${postId}:`, error);
        }
    },

    mapPostToDTO(
        post: PostWithAuthor,
        likeCount: number,
        commentCount: number,
        hasUserLiked: boolean
    ): PostDTO {
        return {
            id: post.id,
            content: post.content,
            imageUrl: post.imageUrl,
            isPublic: post.isPublic,
            createdAt: post.createdAt.toISOString(),
            author: post.author,
            likeCount,
            commentCount,
            hasUserLiked,
        };
    },
};

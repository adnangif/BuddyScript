import { postLikeRepository } from "@/repositories/postLike.repository";
import { postRepository } from "@/repositories/post.repository";
import { DomainError } from "@/shared/errors/domain-error";
import { cacheService, CacheKeys } from "./cache.service";

export interface LikeResult {
    success: boolean;
    likeCount: number;
    message?: string;
}

export const postLikeService = {
    async likePost(userId: string, postId: string): Promise<LikeResult> {
        // Verify post exists
        const post = await postRepository.findById(postId);
        if (!post) {
            throw DomainError.notFound("Post", postId);
        }

        // Check if user already liked this post
        const existingLike = await postLikeRepository.findByUserAndPost(
            userId,
            postId
        );

        if (existingLike) {
            const likeCount = await postLikeRepository.countByPost(postId);
            return {
                success: true,
                likeCount,
                message: "Already liked",
            };
        }

        // Create new like
        await postLikeRepository.create({ postId, userId });

        // Get updated like count
        const likeCount = await postLikeRepository.countByPost(postId);

        // Invalidate like count cache and post cache
        await cacheService.del(CacheKeys.postLikeCount(postId));
        await cacheService.del(CacheKeys.post(postId));
        console.log(`🗑️  Invalidated like count cache for post: ${postId}`);

        return {
            success: true,
            likeCount,
        };
    },

    async unlikePost(userId: string, postId: string): Promise<LikeResult> {
        // Verify post exists
        const post = await postRepository.findById(postId);
        if (!post) {
            throw DomainError.notFound("Post", postId);
        }

        // Delete the like
        await postLikeRepository.delete(userId, postId);

        // Get updated like count
        const likeCount = await postLikeRepository.countByPost(postId);

        // Invalidate like count cache and post cache
        await cacheService.del(CacheKeys.postLikeCount(postId));
        await cacheService.del(CacheKeys.post(postId));
        console.log(`🗑️  Invalidated like count cache for post: ${postId}`);

        return {
            success: true,
            likeCount,
        };
    },
};

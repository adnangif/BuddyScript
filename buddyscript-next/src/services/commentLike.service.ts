import { commentLikeRepository } from "@/repositories/commentLike.repository";
import { commentRepository } from "@/repositories/comment.repository";
import { DomainError } from "@/shared/errors/domain-error";

export interface LikeResult {
    success: boolean;
    likeCount: number;
    message?: string;
}

export const commentLikeService = {
    async likeComment(userId: string, commentId: string): Promise<LikeResult> {
        // Verify comment exists
        const comment = await commentRepository.findById(commentId);
        if (!comment) {
            throw DomainError.notFound("Comment", commentId);
        }

        // Check if user already liked this comment
        const existingLike = await commentLikeRepository.findByUserAndComment(
            userId,
            commentId
        );

        if (existingLike) {
            const likeCount = await commentLikeRepository.countByComment(commentId);
            return {
                success: true,
                likeCount,
                message: "Already liked",
            };
        }

        // Create new like
        await commentLikeRepository.create({ commentId, userId });

        // Get updated like count
        const likeCount = await commentLikeRepository.countByComment(commentId);

        return {
            success: true,
            likeCount,
        };
    },

    async unlikeComment(userId: string, commentId: string): Promise<LikeResult> {
        // Verify comment exists
        const comment = await commentRepository.findById(commentId);
        if (!comment) {
            throw DomainError.notFound("Comment", commentId);
        }

        // Delete the like
        await commentLikeRepository.delete(userId, commentId);

        // Get updated like count
        const likeCount = await commentLikeRepository.countByComment(commentId);

        return {
            success: true,
            likeCount,
        };
    },
};

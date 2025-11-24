import {
    commentRepository,
    type CommentWithAuthor,
} from "@/repositories/comment.repository";
import { postRepository } from "@/repositories/post.repository";
import { commentLikeRepository } from "@/repositories/commentLike.repository";
import { DomainError } from "@/shared/errors/domain-error";

export interface CreateCommentInput {
    postId: string;
    userId: string;
    content: string;
    parentCommentId?: string | null;
}

export interface CommentDTO {
    id: string;
    postId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    parentCommentId: string | null;
    author: {
        id: string;
        firstName: string;
        lastName: string;
    };
    likeCount: number;
    replyCount: number;
    hasUserLiked: boolean;
}

export const commentService = {
    async createComment(input: CreateCommentInput): Promise<CommentDTO> {
        // Validate content
        if (!input.content.trim()) {
            throw DomainError.validation("Comment content cannot be empty");
        }

        // Verify post exists
        const post = await postRepository.findById(input.postId);
        if (!post) {
            throw DomainError.notFound("Post", input.postId);
        }

        // If parentCommentId is provided, verify it exists and belongs to this post
        if (input.parentCommentId) {
            const parentComment = await commentRepository.findById(
                input.parentCommentId
            );

            if (!parentComment) {
                throw DomainError.notFound("Parent comment", input.parentCommentId);
            }

            if (parentComment.postId !== input.postId) {
                throw DomainError.validation(
                    "Parent comment does not belong to this post"
                );
            }
        }

        const createdComment = await commentRepository.create({
            postId: input.postId,
            userId: input.userId,
            content: input.content,
            parentCommentId: input.parentCommentId,
        });

        // Fetch with author info
        const commentWithAuthor = await commentRepository.findByIdWithAuthor(
            createdComment.id
        );

        if (!commentWithAuthor) {
            throw new Error("Failed to retrieve created comment");
        }

        // Get counts
        const likeCount = await commentLikeRepository.countByComment(
            createdComment.id
        );
        const replyCount = await commentRepository.countReplies(createdComment.id);
        const hasUserLiked = !!(await commentLikeRepository.findByUserAndComment(
            input.userId,
            createdComment.id
        ));

        return this.mapCommentToDTO(
            commentWithAuthor,
            likeCount,
            replyCount,
            hasUserLiked
        );
    },

    async listCommentsByPost(
        postId: string,
        params: { userId?: string; parentCommentId?: string | null }
    ): Promise<CommentDTO[]> {
        // Verify post exists
        const post = await postRepository.findById(postId);
        if (!post) {
            throw DomainError.notFound("Post", postId);
        }

        const comments = await commentRepository.listByPostId(postId, {
            parentCommentId: params.parentCommentId,
        });

        // Enrich with counts and user-specific data
        const enrichedComments = await Promise.all(
            comments.map(async (comment) => {
                const likeCount = await commentLikeRepository.countByComment(
                    comment.id
                );
                const replyCount = await commentRepository.countReplies(comment.id);
                const hasUserLiked = params.userId
                    ? !!(await commentLikeRepository.findByUserAndComment(
                        params.userId,
                        comment.id
                    ))
                    : false;

                return this.mapCommentToDTO(
                    comment,
                    likeCount,
                    replyCount,
                    hasUserLiked
                );
            })
        );

        return enrichedComments;
    },

    async getCommentById(commentId: string, userId?: string): Promise<CommentDTO> {
        const comment = await commentRepository.findByIdWithAuthor(commentId);

        if (!comment) {
            throw DomainError.notFound("Comment", commentId);
        }

        const likeCount = await commentLikeRepository.countByComment(commentId);
        const replyCount = await commentRepository.countReplies(commentId);
        const hasUserLiked = userId
            ? !!(await commentLikeRepository.findByUserAndComment(userId, commentId))
            : false;

        return this.mapCommentToDTO(comment, likeCount, replyCount, hasUserLiked);
    },

    async deleteComment(commentId: string, userId: string): Promise<void> {
        const comment = await commentRepository.findById(commentId);

        if (!comment) {
            throw DomainError.notFound("Comment", commentId);
        }

        // Verify ownership
        if (comment.userId !== userId) {
            throw DomainError.forbidden("You can only delete your own comments");
        }

        await commentRepository.delete(commentId);
    },

    mapCommentToDTO(
        comment: CommentWithAuthor,
        likeCount: number,
        replyCount: number,
        hasUserLiked: boolean
    ): CommentDTO {
        return {
            id: comment.id,
            postId: comment.postId,
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
            parentCommentId: comment.parentCommentId,
            author: comment.author,
            likeCount,
            replyCount,
            hasUserLiked,
        };
    },
};

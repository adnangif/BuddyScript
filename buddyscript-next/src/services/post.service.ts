import { postRepository, type PostWithAuthor } from "@/repositories/post.repository";
import { postLikeRepository } from "@/repositories/postLike.repository";
import { commentRepository } from "@/repositories/comment.repository";
import { DomainError } from "@/shared/errors/domain-error";
import { CursorPaginatedResult } from "@/shared/types/pagination";

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

        return this.mapPostToDTO(postWithAuthor, likeCount, commentCount, hasUserLiked);
    },

    async listPosts(params: { 
        userId?: string;
        cursor?: string | null;
        limit?: number;
    }): Promise<CursorPaginatedResult<PostDTO>> {
        const postsResult = await postRepository.listWithAuthors({
            userId: params.userId,
            cursor: params.cursor,
            limit: params.limit,
        });

        // Enrich with counts and user-specific data
        const enrichedPosts = await Promise.all(
            postsResult.data.map(async (post) => {
                const likeCount = await postLikeRepository.countByPost(post.id);
                const commentCount = await commentRepository.listByPostId(post.id).then(c => c.length);
                const hasUserLiked = params.userId
                    ? !!(await postLikeRepository.findByUserAndPost(params.userId, post.id))
                    : false;

                return this.mapPostToDTO(post, likeCount, commentCount, hasUserLiked);
            })
        );

        return {
            data: enrichedPosts,
            nextCursor: postsResult.nextCursor,
            hasMore: postsResult.hasMore,
        };
    },

    async getPostById(postId: string, userId?: string): Promise<PostDTO> {
        const post = await postRepository.findByIdWithAuthor(postId);

        if (!post) {
            throw DomainError.notFound("Post", postId);
        }

        const likeCount = await postLikeRepository.countByPost(postId);
        const commentCount = await commentRepository.listByPostId(postId).then(c => c.length);
        const hasUserLiked = userId
            ? !!(await postLikeRepository.findByUserAndPost(userId, postId))
            : false;

        return this.mapPostToDTO(post, likeCount, commentCount, hasUserLiked);
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

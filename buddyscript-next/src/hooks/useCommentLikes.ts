import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { LikeResponse, CommentsQueryResponse } from "./types";

export const useLikeComment = (commentId: string, postId: string, parentCommentId?: string) => {
    const token = useAuthStore((state) => state.user?.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<LikeResponse> => {
            if (!token) {
                throw new Error("You must be logged in to like a comment.");
            }

            const response = await fetch(`/api/comments/${commentId}/likes`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to like comment");
            }

            return response.json();
        },
        onMutate: async () => {
            // If this is a reply (has parentCommentId), update the replies cache
            if (parentCommentId) {
                await queryClient.cancelQueries({ queryKey: ["replies", parentCommentId] });
                
                const previousReplies = queryClient.getQueryData<CommentsQueryResponse>(["replies", parentCommentId]);
                
                if (previousReplies) {
                    queryClient.setQueryData<CommentsQueryResponse>(["replies", parentCommentId], {
                        comments: previousReplies.comments.map(comment =>
                            comment.id === commentId
                                ? { ...comment, hasUserLiked: true, likeCount: (comment.likeCount ?? 0) + 1 }
                                : comment
                        ),
                    });
                }
                
                return { previousReplies };
            }
            
            // Otherwise, update the top-level comments cache
            await queryClient.cancelQueries({ queryKey: ["comments", postId] });
            
            const previousComments = queryClient.getQueryData<CommentsQueryResponse>(["comments", postId]);
            
            if (previousComments) {
                queryClient.setQueryData<CommentsQueryResponse>(["comments", postId], {
                    comments: previousComments.comments.map(comment =>
                        comment.id === commentId
                            ? { ...comment, hasUserLiked: true, likeCount: (comment.likeCount ?? 0) + 1 }
                            : comment
                    ),
                });
            }
            
            return { previousComments };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (parentCommentId && context?.previousReplies) {
                queryClient.setQueryData(["replies", parentCommentId], context.previousReplies);
            } else if (context?.previousComments) {
                queryClient.setQueryData(["comments", postId], context.previousComments);
            }
        },
        onSettled: () => {
            // Invalidate all related queries
            if (parentCommentId) {
                queryClient.invalidateQueries({ queryKey: ["replies", parentCommentId] });
            }
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
    });
};

export const useUnlikeComment = (commentId: string, postId: string, parentCommentId?: string) => {
    const token = useAuthStore((state) => state.user?.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<LikeResponse> => {
            if (!token) {
                throw new Error("You must be logged in to unlike a comment.");
            }

            const response = await fetch(`/api/comments/${commentId}/likes`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to unlike comment");
            }

            return response.json();
        },
        onMutate: async () => {
            // If this is a reply (has parentCommentId), update the replies cache
            if (parentCommentId) {
                await queryClient.cancelQueries({ queryKey: ["replies", parentCommentId] });
                
                const previousReplies = queryClient.getQueryData<CommentsQueryResponse>(["replies", parentCommentId]);
                
                if (previousReplies) {
                    queryClient.setQueryData<CommentsQueryResponse>(["replies", parentCommentId], {
                        comments: previousReplies.comments.map(comment =>
                            comment.id === commentId
                                ? { ...comment, hasUserLiked: false, likeCount: Math.max(0, (comment.likeCount ?? 0) - 1) }
                                : comment
                        ),
                    });
                }
                
                return { previousReplies };
            }
            
            // Otherwise, update the top-level comments cache
            await queryClient.cancelQueries({ queryKey: ["comments", postId] });
            
            const previousComments = queryClient.getQueryData<CommentsQueryResponse>(["comments", postId]);
            
            if (previousComments) {
                queryClient.setQueryData<CommentsQueryResponse>(["comments", postId], {
                    comments: previousComments.comments.map(comment =>
                        comment.id === commentId
                            ? { ...comment, hasUserLiked: false, likeCount: Math.max(0, (comment.likeCount ?? 0) - 1) }
                            : comment
                    ),
                });
            }
            
            return { previousComments };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (parentCommentId && context?.previousReplies) {
                queryClient.setQueryData(["replies", parentCommentId], context.previousReplies);
            } else if (context?.previousComments) {
                queryClient.setQueryData(["comments", postId], context.previousComments);
            }
        },
        onSettled: () => {
            // Invalidate all related queries
            if (parentCommentId) {
                queryClient.invalidateQueries({ queryKey: ["replies", parentCommentId] });
            }
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
    });
};

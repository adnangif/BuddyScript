import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { LikeResponse, CommentsQueryResponse } from "./types";

export const useLikeComment = (commentId: string, postId: string) => {
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
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["comments", postId] });

            // Snapshot the previous value
            const previousComments = queryClient.getQueryData<CommentsQueryResponse>(["comments", postId]);

            // Optimistically update the cache
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
            if (context?.previousComments) {
                queryClient.setQueryData(["comments", postId], context.previousComments);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
    });
};

export const useUnlikeComment = (commentId: string, postId: string) => {
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
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["comments", postId] });

            // Snapshot the previous value
            const previousComments = queryClient.getQueryData<CommentsQueryResponse>(["comments", postId]);

            // Optimistically update the cache
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
            if (context?.previousComments) {
                queryClient.setQueryData(["comments", postId], context.previousComments);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
    });
};

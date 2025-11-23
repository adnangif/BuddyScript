import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { LikeResponse, PostsQueryResponse } from "./types";

export const useLikePost = (postId: string) => {
    const user = useAuthStore((state) => state.user);
    const token = user?.token;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<LikeResponse> => {
            if (!token) {
                throw new Error("You must be logged in to like a post.");
            }

            const response = await fetch(`/api/posts/${postId}/likes`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to like post");
            }

            return response.json();
        },
        onMutate: async () => {
            const queryKey = ["posts", user?.id];
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousPosts = queryClient.getQueryData<PostsQueryResponse>(queryKey);

            // Optimistically update the cache
            if (previousPosts) {
                queryClient.setQueryData<PostsQueryResponse>(queryKey, {
                    posts: previousPosts.posts.map(post =>
                        post.id === postId
                            ? { ...post, hasUserLiked: true, likeCount: (post.likeCount ?? 0) + 1 }
                            : post
                    ),
                });
            }

            return { previousPosts };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousPosts) {
                queryClient.setQueryData(["posts", user?.id], context.previousPosts);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ["posts", user?.id] });
        },
    });
};

export const useUnlikePost = (postId: string) => {
    const user = useAuthStore((state) => state.user);
    const token = user?.token;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<LikeResponse> => {
            if (!token) {
                throw new Error("You must be logged in to unlike a post.");
            }

            const response = await fetch(`/api/posts/${postId}/likes`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to unlike post");
            }

            return response.json();
        },
        onMutate: async () => {
            const queryKey = ["posts", user?.id];
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousPosts = queryClient.getQueryData<PostsQueryResponse>(queryKey);

            // Optimistically update the cache
            if (previousPosts) {
                queryClient.setQueryData<PostsQueryResponse>(queryKey, {
                    posts: previousPosts.posts.map(post =>
                        post.id === postId
                            ? { ...post, hasUserLiked: false, likeCount: Math.max(0, (post.likeCount ?? 0) - 1) }
                            : post
                    ),
                });
            }

            return { previousPosts };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousPosts) {
                queryClient.setQueryData(["posts", user?.id], context.previousPosts);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ["posts", user?.id] });
        },
    });
};

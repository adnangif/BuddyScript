import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { CommentsQueryResponse, CreateCommentResponse } from "./types";
import { CreateCommentInput } from "@/lib/validators/comments";

export const usePostComments = (postId: string) => {
    const token = useAuthStore((state) => state.user?.token);

    return useQuery({
        queryKey: ["comments", postId],
        queryFn: async (): Promise<CommentsQueryResponse> => {
            const headers: HeadersInit = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(`/api/posts/${postId}/comments`, {
                headers,
            });

            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }

            return response.json();
        },
    });
};

export const useCreateComment = (postId: string) => {
    const token = useAuthStore((state) => state.user?.token);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            input: CreateCommentInput
        ): Promise<CreateCommentResponse> => {
            if (!token) {
                throw new Error("You must be logged in to comment.");
            }

            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create comment");
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate comments query to refetch
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            // Also invalidate posts to update comment count
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
};

export const useCommentReplies = (commentId: string) => {
    const token = useAuthStore((state) => state.user?.token);

    return useQuery({
        queryKey: ["replies", commentId],
        queryFn: async (): Promise<CommentsQueryResponse> => {
            const headers: HeadersInit = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(`/api/comments/${commentId}/replies`, {
                headers,
            });

            if (!response.ok) {
                throw new Error("Failed to fetch replies");
            }

            const data = await response.json();
            return { comments: data.replies };
        },
        enabled: false, // Only fetch when explicitly requested
    });
};

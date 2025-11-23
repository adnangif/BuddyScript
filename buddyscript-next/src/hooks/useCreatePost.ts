"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreatePostResponse } from "@/hooks/types";
import { CreatePostInput } from "@/lib/validators/posts";
import { useAuthStore } from "@/stores/auth-store";

type MutationArgs = {
  payload: CreatePostInput;
  token: string;
};

const createPostRequest = async ({
  payload,
  token,
}: MutationArgs): Promise<CreatePostResponse> => {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorMessage =
      (await response
        .json()
        .catch(() => ({ message: "Unable to create post" }))).message ??
      "Unable to create post";
    throw new Error(errorMessage);
  }

  return (await response.json()) as CreatePostResponse;
};

export const useCreatePost = () => {
  const token = useAuthStore((state) => state.user?.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePostInput) => {
      if (!token) {
        throw new Error("You must be logged in to post.");
      }
      return createPostRequest({ payload, token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};



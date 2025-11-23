"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

import { PostsQueryResponse } from "@/hooks/types";

const fetchPosts = async (token?: string): Promise<PostsQueryResponse> => {
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch("/api/posts", { headers });

  if (!response.ok) {
    throw new Error("Unable to load posts");
  }

  return (await response.json()) as PostsQueryResponse;
};

export const usePosts = () => {
  const token = useAuthStore((state) => state.user?.token);

  return useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(token),
  });
};



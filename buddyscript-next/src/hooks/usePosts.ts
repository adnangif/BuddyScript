"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

import { PostsQueryResponse } from "@/hooks/types";

const fetchPosts = async (
  token?: string,
  cursor?: string | null,
  limit: number = 10
): Promise<PostsQueryResponse> => {
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const params = new URLSearchParams();
  if (cursor) {
    params.set("cursor", cursor);
  }
  params.set("limit", limit.toString());

  const response = await fetch(`/api/posts?${params.toString()}`, { headers });

  if (!response.ok) {
    throw new Error("Unable to load posts");
  }

  return (await response.json()) as PostsQueryResponse;
};

export const usePosts = (limit: number = 10) => {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = user?.token;

  return useInfiniteQuery({
    queryKey: ["posts", user?.id, limit],
    queryFn: ({ pageParam }) => fetchPosts(token, pageParam, limit),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled: hasHydrated, // Only fetch after store has hydrated
  });
};

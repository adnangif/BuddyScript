"use client";

import { useQuery } from "@tanstack/react-query";

import { PostsQueryResponse } from "@/hooks/types";

const fetchPosts = async (): Promise<PostsQueryResponse> => {
  const response = await fetch("/api/posts");

  if (!response.ok) {
    throw new Error("Unable to load posts");
  }

  return (await response.json()) as PostsQueryResponse;
};

export const usePosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });



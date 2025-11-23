import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post cannot be empty")
    .max(500, "Post must be 500 characters or fewer"),
  imageUrl: z.url().optional().nullable(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;



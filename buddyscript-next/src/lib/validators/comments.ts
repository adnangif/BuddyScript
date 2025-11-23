import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be 1000 characters or fewer"),
  parentCommentId: z.uuid().optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

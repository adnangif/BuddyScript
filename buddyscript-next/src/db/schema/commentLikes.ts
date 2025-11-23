import {
    index,
    pgTable,
    timestamp,
    uuid,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { comments } from "./comments";
import { users } from "./users";

export const commentLikes = pgTable(
    "comment_likes",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        commentId: uuid("comment_id")
            .notNull()
            .references(() => comments.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        // Ensure one user can only like a comment once
        uniqueIndex("comment_likes_comment_user_idx").on(table.commentId, table.userId),
        // Index for counting likes per comment
        index("comment_likes_comment_id_idx").on(table.commentId),
        // Index for finding a user's comment likes
        index("comment_likes_user_id_idx").on(table.userId),
    ],
);

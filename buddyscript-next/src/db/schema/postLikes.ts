import {
    index,
    pgTable,
    timestamp,
    uuid,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { posts } from "./posts";
import { users } from "./users";

export const postLikes = pgTable(
    "post_likes",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        postId: uuid("post_id")
            .notNull()
            .references(() => posts.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        // Ensure one user can only like a post once
        uniqueIndex("post_likes_post_user_idx").on(table.postId, table.userId),
        // Index for counting likes per post
        index("post_likes_post_id_idx").on(table.postId),
        // Index for finding a user's likes
        index("post_likes_user_id_idx").on(table.userId),
    ],
);

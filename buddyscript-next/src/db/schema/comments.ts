import {
    index,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { posts } from "./posts";
import { users } from "./users";

export const comments = pgTable(
    "comments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        postId: uuid("post_id")
            .notNull()
            .references(() => posts.id, { onDelete: "cascade" }),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        // parentCommentId allows for nested replies (null = top-level comment)
        parentCommentId: uuid("parent_comment_id").references((): any => comments.id, {
            onDelete: "cascade",
        }),
        content: text("content").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        // Index for fetching all comments on a post
        index("comments_post_id_idx").on(table.postId),
        // Index for fetching replies to a comment
        index("comments_parent_comment_id_idx").on(table.parentCommentId),
        // Index for sorting by creation time
        index("comments_created_at_idx").on(table.createdAt),
        // Index for finding a user's comments
        index("comments_user_id_idx").on(table.userId),
    ],
);

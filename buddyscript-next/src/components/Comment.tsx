"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { toast } from "sonner";
import { Comment as CommentType } from "@/hooks/types";
import { useLikeComment, useUnlikeComment } from "@/hooks/useCommentLikes";
import { useCreateComment } from "@/hooks/useComments";
import { useCommentReplies } from "@/hooks/useComments";

const dateFormatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
});

const formatTimestamp = (isoString: string) =>
    dateFormatter.format(new Date(isoString));

type CommentProps = {
    comment: CommentType;
    postId: string;
    depth?: number;
};

export default function Comment({ comment, postId, depth = 0 }: CommentProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [showReplies, setShowReplies] = useState(false);

    const { mutate: likeComment, isPending: isLiking } = useLikeComment(
        comment.id,
        postId,
        comment.parentCommentId ?? undefined
    );
    const { mutate: unlikeComment, isPending: isUnliking } = useUnlikeComment(
        comment.id,
        postId,
        comment.parentCommentId ?? undefined
    );
    const { mutate: createReply, isPending: isReplying } = useCreateComment(postId);
    const {
        data: repliesData,
        refetch: fetchReplies,
        isLoading: isLoadingReplies,
    } = useCommentReplies(comment.id);

    const handleLikeToggle = () => {
        if (isLiking || isUnliking) return;

        if (comment.hasUserLiked) {
            unlikeComment(undefined, {
                onError: (error) => {
                    toast.error(error.message || "Failed to unlike comment");
                },
            });
        } else {
            likeComment(undefined, {
                onError: (error) => {
                    toast.error(error.message || "Failed to like comment");
                },
            });
        }
    };

    const handleReplySubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = replyContent.trim();

        if (!trimmed) {
            toast.error("Reply cannot be empty");
            return;
        }

        createReply(
            { content: trimmed, parentCommentId: comment.id },
            {
                onSuccess: () => {
                    setReplyContent("");
                    setShowReplyForm(false);
                    toast.success("Reply posted!");
                    // Refetch replies to show the new one
                    fetchReplies();
                    setShowReplies(true);
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to post reply");
                },
            }
        );
    };

    const handleShowReplies = () => {
        if (!showReplies) {
            fetchReplies();
        }
        setShowReplies(!showReplies);
    };

    const hasReplies = (comment.replyCount ?? 0) > 0;
    const maxDepth = 3; // Limit nesting depth

    return (
        <div
            style={{
                marginLeft: depth > 0 ? "24px" : "0",
                marginBottom: "16px",
                borderLeft: depth > 0 ? "2px solid #e0e0e0" : "none",
                paddingLeft: depth > 0 ? "12px" : "0",
            }}
        >
            <div
                style={{
                    padding: "12px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#ddd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                        }}
                    >
                        {comment.author.firstName[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: "600", fontSize: "14px" }}>
                            {comment.author.firstName} {comment.author.lastName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                            {formatTimestamp(comment.createdAt)}
                        </div>
                    </div>
                </div>

                <p style={{ margin: "8px 0", fontSize: "14px" }}>{comment.content}</p>

                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "8px" }}>
                    <button
                        type="button"
                        onClick={handleLikeToggle}
                        disabled={isLiking || isUnliking}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: isLiking || isUnliking ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "13px",
                            color: comment.hasUserLiked ? "#dc2626" : "#666",
                            fontWeight: comment.hasUserLiked ? "600" : "normal",
                            transition: "all 0.2s ease",
                            opacity: isLiking || isUnliking ? 0.6 : 1,
                        }}
                    >
                        <span style={{ 
                            fontSize: "16px",
                            transition: "transform 0.2s ease",
                            display: "inline-block",
                            transform: comment.hasUserLiked ? "scale(1.1)" : "scale(1)",
                        }}>
                            {comment.hasUserLiked ? "❤️" : "🤍"}
                        </span>
                        <span>{comment.likeCount ?? 0}</span>
                    </button>

                    {depth < maxDepth && (
                        <button
                            type="button"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: "#666",
                            }}
                        >
                            Reply
                        </button>
                    )}

                    {hasReplies && (
                        <button
                            type="button"
                            onClick={handleShowReplies}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: "#0066cc",
                            }}
                        >
                            {showReplies ? "Hide" : "View"} {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
                        </button>
                    )}
                </div>

                {showReplyForm && (
                    <form
                        onSubmit={handleReplySubmit}
                        style={{ marginTop: "12px" }}
                    >
                        <textarea
                            value={replyContent}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setReplyContent(e.target.value)
                            }
                            placeholder="Write a reply..."
                            maxLength={1000}
                            disabled={isReplying}
                            style={{
                                width: "100%",
                                minHeight: "60px",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                fontSize: "14px",
                                resize: "vertical",
                            }}
                        />
                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <button
                                type="submit"
                                disabled={isReplying}
                                style={{
                                    padding: "6px 16px",
                                    background: "#0066cc",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }}
                            >
                                {isReplying ? "Posting..." : "Post Reply"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReplyForm(false);
                                    setReplyContent("");
                                }}
                                disabled={isReplying}
                                style={{
                                    padding: "6px 16px",
                                    background: "#f0f0f0",
                                    color: "#333",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {showReplies && (
                <div style={{ marginTop: "12px" }}>
                    {isLoadingReplies ? (
                        <p style={{ fontSize: "13px", color: "#666", marginLeft: "12px" }}>
                            Loading replies...
                        </p>
                    ) : (
                        repliesData?.comments.map((reply) => (
                            <Comment
                                key={reply.id}
                                comment={reply}
                                postId={postId}
                                depth={depth + 1}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

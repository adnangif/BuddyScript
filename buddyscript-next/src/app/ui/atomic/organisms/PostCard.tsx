import React, { useState, FormEvent, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { FeedPost } from '@/hooks/types';
import { useAuthStore } from '@/stores/auth-store';
import { useLikePost, useUnlikePost } from '@/hooks/useLikes';
import { usePostComments, useCreateComment } from '@/hooks/useComments';
import Comment from '@/components/Comment';
import { Badge, PostActions, CommentForm } from '@/app/ui/atomic';

const dateFormatter = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const formatTimestamp = (isoString: string) =>
    dateFormatter.format(new Date(isoString));

export interface PostCardProps {
    post: FeedPost;
}

/**
 * PostCard Organism
 * Displays an individual post with all interactions (likes, comments)
 * Complex component combining multiple molecules and atoms
 */
export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const user = useAuthStore((state) => state.user);

    const { mutate: likePost, isPending: isLiking } = useLikePost(post.id);
    const { mutate: unlikePost, isPending: isUnliking } = useUnlikePost(post.id);
    const { mutate: createComment, isPending: isCommenting } = useCreateComment(post.id);
    const { data: commentsData, isLoading: isLoadingComments } = usePostComments(post.id);

    const isOwnPost = user?.id === post.author.id;

    const handleLikeToggle = () => {
        if (isLiking || isUnliking) return;

        if (post.hasUserLiked) {
            unlikePost(undefined, {
                onError: (error) => {
                    toast.error(error.message || 'Failed to unlike post');
                },
            });
        } else {
            likePost(undefined, {
                onError: (error) => {
                    toast.error(error.message || 'Failed to like post');
                },
            });
        }
    };

    const handleCommentSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = commentContent.trim();

        if (!trimmed) {
            toast.error('Comment cannot be empty');
            return;
        }

        createComment(
            { content: trimmed, parentCommentId: null },
            {
                onSuccess: () => {
                    setCommentContent('');
                    toast.success('Comment posted!');
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to post comment');
                },
            }
        );
    };

    return (
        <article className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
            <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                <div className="_feed_inner_timeline_post_top">
                    <div className="_feed_inner_timeline_post_box">
                        <div className="_feed_inner_timeline_post_box_image">
                            <img
                                src="/icons/post_img.png"
                                alt={post.author.firstName}
                                className="_post_img"
                            />
                        </div>
                        <div className="_feed_inner_timeline_post_box_txt">
                            <h4 className="_feed_inner_timeline_post_box_title">
                                {post.author.firstName} {post.author.lastName}
                                {!post.isPublic && isOwnPost && (
                                    <Badge variant="default" className="_ml_8">
                                        🔒 Private
                                    </Badge>
                                )}
                            </h4>
                            <p className="_feed_inner_timeline_post_box_para">
                                {formatTimestamp(post.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
                <p className="_feed_inner_timeline_post_title">{post.content}</p>
                {post.imageUrl && (
                    <div style={{ marginTop: '16px' }}>
                        <img
                            src={post.imageUrl}
                            alt="Post attachment"
                            style={{
                                maxWidth: '100%',
                                borderRadius: '8px',
                                display: 'block',
                            }}
                        />
                    </div>
                )}

                {/* Like and Comment Actions using atomic component */}
                <PostActions
                    likeCount={post.likeCount ?? 0}
                    commentCount={post.commentCount ?? 0}
                    hasUserLiked={post.hasUserLiked ?? false}
                    onLikeToggle={handleLikeToggle}
                    onCommentToggle={() => setShowComments(!showComments)}
                    isLiking={isLiking}
                    isUnliking={isUnliking}
                    showComments={showComments}
                />

                {/* Comments Section */}
                {showComments && (
                    <div
                        style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e0e0e0',
                        }}
                    >
                        {/* Comment Form using atomic component */}
                        <CommentForm
                            value={commentContent}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setCommentContent(e.target.value)
                            }
                            onSubmit={handleCommentSubmit}
                            isSubmitting={isCommenting}
                            placeholder="Write a comment..."
                            maxLength={1000}
                        />

                        {/* Comments List */}
                        {isLoadingComments ? (
                            <p style={{ fontSize: '14px', color: '#666' }}>Loading comments...</p>
                        ) : commentsData?.comments && commentsData.comments.length > 0 ? (
                            <div>
                                {commentsData.comments.map((comment) => (
                                    <Comment key={comment.id} comment={comment} postId={post.id} />
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                No comments yet. Be the first to comment!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
};

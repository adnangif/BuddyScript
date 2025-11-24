import React from 'react';

export interface PostActionsProps {
    likeCount: number;
    commentCount: number;
    hasUserLiked: boolean;
    onLikeToggle: () => void;
    onCommentToggle: () => void;
    isLiking?: boolean;
    isUnliking?: boolean;
    showComments?: boolean;
}

/**
 * PostActions Molecule
 * Like and comment action buttons with counts for posts
 */
export const PostActions: React.FC<PostActionsProps> = ({
    likeCount,
    commentCount,
    hasUserLiked,
    onLikeToggle,
    onCommentToggle,
    isLiking = false,
    isUnliking = false,
    showComments = false
}) => {
    const isProcessing = isLiking || isUnliking;

    return (
        <div style={{
            display: 'flex',
            gap: '24px',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid #e0e0e0'
        }}>
            <button
                type="button"
                onClick={onLikeToggle}
                disabled={isProcessing}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    color: hasUserLiked ? '#dc2626' : '#666',
                    fontWeight: hasUserLiked ? '600' : 'normal',
                    transition: 'all 0.2s ease',
                    opacity: isProcessing ? 0.6 : 1,
                }}
            >
                <span style={{
                    fontSize: '20px',
                    transition: 'transform 0.2s ease',
                    display: 'inline-block',
                    transform: hasUserLiked ? 'scale(1.1)' : 'scale(1)',
                }}>
                    {hasUserLiked ? '❤️' : '🤍'}
                </span>
                <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            </button>

            <button
                type="button"
                onClick={onCommentToggle}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    color: showComments ? '#0066cc' : '#666',
                    fontWeight: showComments ? '600' : 'normal',
                }}
            >
                <span style={{ fontSize: '18px' }}>💬</span>
                <span>{commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}</span>
            </button>
        </div>
    );
};

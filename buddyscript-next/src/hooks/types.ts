export type AuthMutationResponse = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token: string;
  expiresInSeconds: number;
};

export type AuthErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export type PostAuthor = {
  id: string;
  firstName: string;
  lastName: string;
};

export type FeedPost = {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  author: PostAuthor;
  likeCount?: number;
  commentCount?: number;
  hasUserLiked?: boolean;
};

export type PostsQueryResponse = {
  posts: FeedPost[];
};

export type CreatePostResponse = {
  post: FeedPost;
};

export type CommentAuthor = {
  id: string;
  firstName: string;
  lastName: string;
};

export type Comment = {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  parentCommentId?: string | null;
  likeCount?: number;
  hasUserLiked?: boolean;
  replyCount?: number;
  replies?: Comment[];
};

export type CommentsQueryResponse = {
  comments: Comment[];
};

export type CreateCommentResponse = {
  comment: Comment;
};

export type LikeResponse = {
  success: boolean;
  likeCount: number;
};



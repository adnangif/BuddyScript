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
};

export type PostsQueryResponse = {
  posts: FeedPost[];
};

export type CreatePostResponse = {
  post: FeedPost;
};



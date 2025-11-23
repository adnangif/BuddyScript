export type AuthMutationResponse = {
  user: {
    id: string;
    email: string;
  };
  token: string;
  expiresInSeconds: number;
};

export type AuthErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};



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



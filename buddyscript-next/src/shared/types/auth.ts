export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthPayload {
    sub: string;
    email: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    token: string;
    expiresInSeconds: number;
}

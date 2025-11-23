import jwt, { SignOptions } from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set");
}

type BaseJwtPayload = {
  sub: string;
  email: string;
};

export const signAuthToken = (payload: BaseJwtPayload, options?: SignOptions) =>
  jwt.sign(payload, jwtSecret, {
    expiresIn: "1h",
    ...options,
  });

export const verifyAuthToken = (token: string) =>
  jwt.verify(token, jwtSecret) as BaseJwtPayload & { exp: number; iat: number };


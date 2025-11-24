import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { dbClient } from "@/database/client";
import { users } from "@/db/schema";
import { verifyAuthToken } from "@/lib/jwt";
import { DomainError } from "@/shared/errors/domain-error";
import type { AuthUser } from "@/shared/types/auth";

export async function authenticateRequest(
    request: NextRequest
): Promise<AuthUser | null> {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
        return null;
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return null;
    }

    try {
        const payload = verifyAuthToken(token);
        const user = await dbClient.query.users.findFirst({
            where: eq(users.id, payload.sub),
        });
        return user ?? null;
    } catch {
        return null;
    }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
    const user = await authenticateRequest(request);

    if (!user) {
        throw DomainError.unauthorized();
    }

    return user;
}

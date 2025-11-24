import { eq } from "drizzle-orm";
import { dbClient } from "@/database/client";
import { users } from "@/db/schema";
import type { AuthUser } from "@/shared/types/auth";

export const userRepository = {
    async findById(id: string): Promise<AuthUser | null> {
        const user = await dbClient.query.users.findFirst({
            where: eq(users.id, id),
        });
        return user ?? null;
    },

    async findByEmail(email: string): Promise<AuthUser | null> {
        const user = await dbClient.query.users.findFirst({
            where: eq(users.email, email.toLowerCase()),
        });
        return user ?? null;
    },

    async create(payload: {
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
    }): Promise<AuthUser> {
        const [createdUser] = await dbClient
            .insert(users)
            .values({
                email: payload.email.toLowerCase(),
                passwordHash: payload.passwordHash,
                firstName: payload.firstName,
                lastName: payload.lastName,
            })
            .returning();

        return createdUser;
    },

    async updatePassword(
        userId: string,
        newPasswordHash: string
    ): Promise<AuthUser> {
        const [updatedUser] = await dbClient
            .update(users)
            .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();

        return updatedUser;
    },
};

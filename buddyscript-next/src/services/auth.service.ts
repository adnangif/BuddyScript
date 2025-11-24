import bcrypt from "bcryptjs";
import { userRepository } from "@/repositories/user.repository";
import { DomainError } from "@/shared/errors/domain-error";
import { signAuthToken } from "@/lib/jwt";
import type { AuthResponse } from "@/shared/types/auth";

export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export const authService = {
    async register(input: RegisterInput): Promise<AuthResponse> {
        // Check if user already exists
        const existingUser = await userRepository.findByEmail(input.email);

        if (existingUser) {
            throw DomainError.conflict("Email is already registered");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 12);

        // Create user
        const createdUser = await userRepository.create({
            email: input.email,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
        });

        // Generate token
        const token = signAuthToken({
            sub: createdUser.id,
            email: createdUser.email,
        });

        return {
            user: {
                id: createdUser.id,
                email: createdUser.email,
                firstName: createdUser.firstName,
                lastName: createdUser.lastName,
            },
            token,
            expiresInSeconds: 3600,
        };
    },

    async login(input: LoginInput): Promise<AuthResponse> {
        // Find user by email
        const existingUser = await userRepository.findByEmail(input.email);

        if (!existingUser) {
            throw DomainError.unauthorized("Invalid email or password");
        }

        // Verify password
        const passwordMatches = await bcrypt.compare(
            input.password,
            existingUser.passwordHash
        );

        if (!passwordMatches) {
            throw DomainError.unauthorized("Invalid email or password");
        }

        // Generate token
        const token = signAuthToken({
            sub: existingUser.id,
            email: existingUser.email,
        });

        return {
            user: {
                id: existingUser.id,
                email: existingUser.email,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
            },
            token,
            expiresInSeconds: 3600,
        };
    },
};

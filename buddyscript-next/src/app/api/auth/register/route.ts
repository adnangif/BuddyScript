import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { registerSchema } from "@/lib/validators/auth";
import { signAuthToken } from "@/lib/jwt";

export async function POST(request: Request) {
  const rawBody = await request.json();
  const result = registerSchema.safeParse(rawBody);

  if (!result.success) {
    return NextResponse.json(
      {
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, password } = result.data;

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [createdUser] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
      })
      .returning();

    const token = signAuthToken({
      sub: createdUser.id,
      email: createdUser.email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
    });

    return NextResponse.json(
      {
        user: {
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
        },
        token,
        expiresInSeconds: 3600,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}


import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { registerSchema } from "@/lib/validators/auth";
import { signAuthToken } from "@/lib/jwt";

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    console.log(rawBody)
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid or missing JSON body" },
      { status: 400 },
    );
  }
  const result = registerSchema.safeParse(rawBody);

  if (!result.success) {
    return NextResponse.json(
      {
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password } = result.data;

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
        email: email.toLowerCase(),
        passwordHash,
      })
      .returning();

    const token = signAuthToken({
      sub: createdUser.id,
      email: createdUser.email,
    });

    return NextResponse.json(
      {
        user: {
          id: createdUser.id,
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


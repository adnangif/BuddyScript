import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { loginSchema } from "@/lib/validators/auth";
import { signAuthToken } from "@/lib/jwt";

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid or missing JSON body" },
      { status: 400 },
    );
  }

  const result = loginSchema.safeParse(rawBody);

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

    if (!existingUser) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      existingUser.passwordHash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = signAuthToken({
      sub: existingUser.id,
      email: existingUser.email,
    });

    return NextResponse.json(
      {
        user: {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
        },
        token,
        expiresInSeconds: 3600,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      { message: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}



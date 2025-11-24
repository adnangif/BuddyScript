import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { authService } from "@/services/auth.service";
import { DomainError } from "@/shared/errors/domain-error";

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

  try {
    const response = await authService.login(result.data);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Login failed", error);
    return NextResponse.json(
      { message: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}



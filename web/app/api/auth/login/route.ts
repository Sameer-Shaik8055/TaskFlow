import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";
import { signToken } from "@/lib/auth";

// POST /api/auth/login
// Body: { email, password }  →  checks credentials and returns a JWT.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    // Must match the normalization we used at registration time.
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Use ONE generic message whether the email is unknown OR the password
    // is wrong. Saying "no such email" would let attackers discover which
    // emails have accounts (called "user enumeration").
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }, // 401 = Unauthorized
      );
    }

    const token = signToken({ userId: user.id });
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

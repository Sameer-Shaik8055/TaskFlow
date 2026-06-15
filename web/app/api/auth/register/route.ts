import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { signToken } from "@/lib/auth";

// POST /api/auth/register
// Body: { email, password }  →  creates a user and returns a JWT.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    // ── 1. Validate the input ────────────────────────────────────────
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }, // 400 = Bad Request
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    // Store emails in one consistent shape so "A@x.com" == "a@x.com".
    const normalizedEmail = email.trim().toLowerCase();

    // ── 2. Reject duplicates with a friendly message ─────────────────
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }, // 409 = Conflict
      );
    }

    // ── 3. Hash the password, then save the user ─────────────────────
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, password: passwordHash },
    });

    // ── 4. Issue a token so they're logged in immediately ────────────
    const token = signToken({ userId: user.id });

    // NEVER send the password hash back to the client.
    return NextResponse.json(
      { token, user: { id: user.id, email: user.email } },
      { status: 201 }, // 201 = Created
    );
  } catch (err) {
    // Safety net: if two requests race past the duplicate check above,
    // the DB's unique constraint still protects us (Prisma code "P2002").
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    console.error("register error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }, // 500 = Server Error
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

// GET /api/tasks  →  list the logged-in user's tasks (newest first)
export async function GET(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The `where: { userId }` is the key line: a user can ONLY ever read
  // their own tasks. There is no way to ask for someone else's.
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tasks });
}

// POST /api/tasks  →  create a task for the logged-in user
export async function POST(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title } = body ?? {};

    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    // We attach the userId from the TOKEN, never from the request body —
    // so a user can't create a task "owned" by someone else.
    const task = await prisma.task.create({
      data: { title: title.trim(), userId },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    console.error("create task error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

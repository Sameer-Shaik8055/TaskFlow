import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

// PATCH /api/tasks/:id  →  update a task you own (title and/or completed)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Build the update from only the fields that were sent, so the client
    // can change just the title, just `completed`, or both. (That's what
    // makes this PATCH = a partial update, vs PUT = replace everything.)
    const data: { title?: string; completed?: boolean } = {};

    if (typeof body?.title === "string") {
      if (body.title.trim().length === 0) {
        return NextResponse.json(
          { error: "Title cannot be empty." },
          { status: 400 },
        );
      }
      data.title = body.title.trim();
    }
    if (typeof body?.completed === "boolean") {
      data.completed = body.completed;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    // OWNERSHIP CHECK: only match the task if it belongs to THIS user.
    // This is what stops user A from editing user B's tasks.
    const existing = await prisma.task.findFirst({
      where: { id: params.id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ task });
  } catch (err) {
    console.error("update task error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

// DELETE /api/tasks/:id  →  delete a task you own
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Same ownership check before we delete anything.
  const existing = await prisma.task.findFirst({
    where: { id: params.id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}

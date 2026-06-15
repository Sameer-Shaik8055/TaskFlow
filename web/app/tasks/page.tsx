"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// The shape of a task coming back from our API.
type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Build request headers that include the saved JWT.
  function authHeaders(): Record<string, string> {
    const token = localStorage.getItem("token") ?? "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Runs once when the page loads: make sure we're logged in, then fetch.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTasks() {
    setError("");
    try {
      const res = await fetch("/api/tasks", { headers: authHeaders() });
      if (res.status === 401) {
        // Token missing/expired → bounce back to login.
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch {
      setError("Could not load your tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => [data.task, ...prev]); // newest on top
      setNewTitle("");
    }
  }

  async function toggleTask(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ completed: !task.completed }),
    });
    if (res.ok) {
      const data = await res.json();
      // Swap in just the one task that changed.
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
    }
  }

  async function deleteTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg p-4">
      <header className="mb-6 flex items-center justify-between pt-6">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <button
          onClick={logout}
          className="text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          Log out
        </button>
      </header>

      {/* Add-task form */}
      <form onSubmit={addTask} className="mb-6 flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs doing?"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Task list */}
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="rounded-lg bg-white px-4 py-8 text-center text-gray-400 shadow-sm">
          No tasks yet. Add your first one above! ✨
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
                className="h-5 w-5 cursor-pointer accent-blue-600"
              />
              <span
                className={`flex-1 ${
                  task.completed ? "text-gray-400 line-through" : "text-gray-900"
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="text-sm text-gray-400 transition hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

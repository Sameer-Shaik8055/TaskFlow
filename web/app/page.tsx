"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The landing page ("/") just decides where to send you:
//   • logged in (a token is saved)  → your tasks
//   • otherwise                     → the login screen
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    router.replace(token ? "/tasks" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Loading…</p>
    </main>
  );
}

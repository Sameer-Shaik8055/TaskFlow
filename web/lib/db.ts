import { PrismaClient } from "@prisma/client";

// We want exactly ONE PrismaClient for the whole app.
//
// Problem: in development, Next.js hot-reloads your code on every save.
// If we wrote `new PrismaClient()` directly, each reload would create a
// brand-new client and open new DB connections until the database refuses
// any more ("too many connections").
//
// Fix: cache the client on Node's global object. On reload, we reuse the
// cached one instead of making a new connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Only cache in dev. In production each serverless instance makes its own.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

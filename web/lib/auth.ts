import jwt from "jsonwebtoken";

// Pull the signing secret out of .env, failing loudly if it's missing.
// TypeScript treats every process.env value as possibly-undefined, so we
// validate it inside a function that RETURNS a guaranteed `string`. That
// way every use below is type-safe (and we fail fast at startup, not later).
function requireSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in your .env file");
  }
  return secret;
}

const JWT_SECRET = requireSecret();

// What we put INSIDE the token. Keep it tiny — the token rides along on
// every request. We only need the user's id to know who is calling.
export type TokenPayload = {
  userId: string;
};

// Create a signed token (called when a user registers or logs in).
// "Signed" = anyone can READ the contents, but only our server (which holds
// JWT_SECRET) can produce a VALID signature. So nobody can forge a login.
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify a token coming in from a request.
// Returns the payload if the token is valid, or null if it's missing,
// tampered with, or expired.
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // jwt.verify can return a raw string for non-object payloads;
    // ours is always an object, so guard against that case.
    if (typeof decoded === "string") return null;
    return decoded as TokenPayload;
  } catch {
    // Bad signature / expired / malformed → treat as not authenticated.
    return null;
  }
}

// Pull the logged-in user's id out of a request's Authorization header.
// We expect the standard format:  Authorization: Bearer <token>
// Returns the userId if the token is valid, otherwise null.
export function getUserId(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

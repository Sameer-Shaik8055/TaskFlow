import bcrypt from "bcryptjs";

// "Salt rounds" = how much work bcrypt does (2^rounds iterations).
// Higher = slower to compute = harder for attackers to brute-force.
// 10 is the common, well-balanced default.
const SALT_ROUNDS = 10;

// Turn a plain-text password into a one-way hash to store in the DB.
// bcrypt automatically adds a random "salt", so the SAME password produces
// a DIFFERENT hash every time — which is exactly what we want.
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// Check a login attempt. bcrypt pulls the salt out of the stored hash,
// re-hashes the plain password the same way, and compares the result.
// Returns true only if they match.
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

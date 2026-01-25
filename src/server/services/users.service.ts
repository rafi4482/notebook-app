import { db } from "../../db";
import { appUsers } from "../../db/schema";
import { eq } from "drizzle-orm";

/**
 * Find a user by their auth ID
 */
export async function findUserByAuthId(authId: string) {
  return db
    .select()
    .from(appUsers)
    .where(eq(appUsers.authId, authId))
    .then((res) => res[0]);
}

/**
 * Find a user by their email
 */
export async function findUserByEmail(email: string) {
  return db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email))
    .then((res) => res[0]);
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  name: string | null;
  authId: string;
}) {
  return db
    .insert(appUsers)
    .values(data)
    .returning()
    .then((res) => res[0]);
}

/**
 * Find or create a user by session data
 */
export async function findOrCreateUser(session: {
  user: { id: string; email?: string | null; name?: string | null };
}) {
  // Check if user exists by authId
  const existingUser = await findUserByAuthId(session.user.id);
  if (existingUser) {
    return existingUser;
  }

  // Check if user exists by email (fallback check)
  const email = session.user.email || "";
  if (email) {
    const userByEmail = await findUserByEmail(email);
    if (userByEmail) {
      return userByEmail;
    }
  }

  // Create new user
  return createUser({
    email,
    name: session.user.name || null,
    authId: session.user.id,
  });
}

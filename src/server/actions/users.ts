"use server";

import { db } from "../../db";
import { appUsers } from "../../db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "../../utils/auth";

/**
 * Get or create a user from the better-auth session
 */
export async function getOrCreateUser() {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: Object.fromEntries(hdrs.entries()),
  });

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  // Check if user exists
  const existingUser = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.authId, session.user.id))
    .then((res) => res[0]);

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const newUser = await db
    .insert(appUsers)
    .values({
      email: session.user.email || "",
      name: session.user.name || null,
      authId: session.user.id,
    })
    .returning()
    .then((res) => res[0]);

  return newUser;
}


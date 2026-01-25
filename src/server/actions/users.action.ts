"use server";

import { headers } from "next/headers";
import { auth } from "../../utils/auth";
import { findOrCreateUser } from "../services/users.service";

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

  return findOrCreateUser(session);
}

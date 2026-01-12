import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSession() {
  const h = await headers();
  return auth.api.getSession({ headers: h });
}

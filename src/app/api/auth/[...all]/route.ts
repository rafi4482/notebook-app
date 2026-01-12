export const runtime = "nodejs";

import { auth } from "@/src/utils/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

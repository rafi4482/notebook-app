import "../styles/globals.css";
import { headers } from "next/headers";
import { auth } from "@/src/utils/auth";
import AuthButtons from "../components/auth/AuthButtons";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: Object.fromEntries(hdrs.entries()),
  });

  return (
    <html lang="en">
      <body>
        <header className="p-4 border-b flex justify-end">
          <AuthButtons user={session?.user ?? null} />
        </header>
        {children}
      </body>
    </html>
  );
}

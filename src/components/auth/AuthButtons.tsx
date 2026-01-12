"use client";

import { authClient } from "@/src/utils/auth-client";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function AuthButtons({
  user,
}: {
  user: User | null;
}) {
  const signIn = async () => {
    await authClient.signIn.social({ provider: "github" });
  };

  const signOut = async () => {
    await authClient.signOut();
    window.location.reload(); 
  };

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Sign in with GitHub
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.image && (
        <img
          src={user.image}
          alt="User avatar"
          className="w-8 h-8 rounded-full"
        />
      )}

      <span className="text-sm">
        {user.name ?? user.email}
      </span>

      <button
        onClick={signOut}
        className="text-sm text-red-500 hover:underline"
      >
        Logout
      </button>
    </div>
  );
}

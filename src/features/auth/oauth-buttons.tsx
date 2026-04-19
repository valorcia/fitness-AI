"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function OAuthButtons({
  providers,
  callbackUrl,
}: {
  providers: { google?: boolean; apple?: boolean; facebook?: boolean };
  callbackUrl: string;
}) {
  return (
    <div className="grid gap-2">
      {providers.google && (
        <Button variant="outline" type="button" onClick={() => signIn("google", { callbackUrl })}>
          Continuer avec Google
        </Button>
      )}
      {providers.apple && (
        <Button variant="outline" type="button" onClick={() => signIn("apple", { callbackUrl })}>
          Continuer avec Apple
        </Button>
      )}
      {providers.facebook && (
        <Button variant="outline" type="button" onClick={() => signIn("facebook", { callbackUrl })}>
          Continuer avec Facebook
        </Button>
      )}
    </div>
  );
}

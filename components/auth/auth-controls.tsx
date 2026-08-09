"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";

type AuthControlsProps = {
  initialIsAuthenticated: boolean;
};

function hasSubject(claims: Record<string, unknown> | null | undefined) {
  return typeof claims?.sub === "string" && claims.sub.length > 0;
}

export function AuthControls({ initialIsAuthenticated }: AuthControlsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);

  useEffect(() => {
    let isActive = true;
    const supabase = createClient();

    void supabase.auth
      .getClaims()
      .then(({ data, error }) => {
        if (isActive && !error) {
          setIsAuthenticated(hasSubject(data?.claims));
        }
      })
      .catch((error: unknown) => {
        console.error("Supabase browser auth state check failed", error);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isActive) {
        setIsAuthenticated(Boolean(session?.user?.id));
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated) {
    return <SignOutForm />;
  }

  return (
    <>
      <Link
        aria-label="サインイン"
        className="secondary-button size-10 px-0 sm:w-auto sm:px-3"
        href="/signin"
      >
        <Icon name="user" size={18} />
        <span className="hidden sm:inline">サインイン</span>
      </Link>
      <Link
        aria-label="サインアップ"
        className="primary-button size-10 whitespace-nowrap px-0 sm:w-auto sm:px-4"
        href="/signup"
      >
        <Icon name="userPlus" size={18} />
        <span className="hidden sm:inline">サインアップ</span>
      </Link>
    </>
  );
}

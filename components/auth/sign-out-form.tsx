"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signOutAction, type SignOutActionState } from "@/app/auth/actions";
import { Icon } from "@/components/ui/icon";

const initialState: SignOutActionState = {
  message: "",
};

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-label="サインアウト"
      className="secondary-button size-10 px-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-3"
      disabled={pending}
      type="submit"
    >
      <Icon name="logOut" size={18} />
      <span className="hidden sm:inline">{pending ? "処理中…" : "サインアウト"}</span>
    </button>
  );
}

export function SignOutForm() {
  const [state, formAction] = useActionState(signOutAction, initialState);

  return (
    <div className="relative">
      <form action={formAction}>
        <SignOutButton />
      </form>
      {state.message && (
        <p
          className="absolute right-0 top-12 w-64 rounded-xl border border-red-500/20 bg-[var(--surface-raised)] px-3 py-2.5 text-sm leading-5 text-red-700 shadow-lg dark:text-red-300"
          role="alert"
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

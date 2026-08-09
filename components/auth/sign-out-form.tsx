"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { signOutAction, type SignOutActionState } from "@/app/auth/actions";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";

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
  const { showToast } = useToast();

  useEffect(() => {
    if (state.message) {
      showToast({ message: state.message, tone: "error" });
    }
  }, [showToast, state]);

  return (
    <form action={formAction}>
      <SignOutButton />
    </form>
  );
}

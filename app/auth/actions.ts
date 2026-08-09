"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signOutCurrentUser } from "@/lib/supabase/auth";

export type SignOutActionState = {
  message: string;
};

export async function signOutAction(
  previousState: SignOutActionState,
): Promise<SignOutActionState> {
  void previousState;
  const result = await signOutCurrentUser();

  if (result.status === "error") {
    return {
      message: "サインアウトできませんでした。時間をおいて、もう一度お試しください。",
    };
  }

  revalidatePath("/", "layout");

  if (result.status === "unauthenticated") {
    redirect("/signin");
  }

  redirect("/");
}

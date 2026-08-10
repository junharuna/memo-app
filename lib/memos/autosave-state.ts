import type { MemoFieldErrors } from "@/lib/memos/form-state";

export type AutosaveMemoResult =
  | { revision: number; status: "saved"; updatedAt: string }
  | { message: string; status: "conflict" | "error" | "trashed" | "unauthenticated" }
  | { fieldErrors: MemoFieldErrors; message: string; status: "invalid" };

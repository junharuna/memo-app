export type MemoLifecycleActionState = {
  message: string;
  status: "error" | "idle" | "success";
};

export const initialMemoLifecycleActionState: MemoLifecycleActionState = {
  message: "",
  status: "idle",
};

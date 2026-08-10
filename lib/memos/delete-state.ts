export type DeleteMemoState = {
  message: string;
  status: "error" | "idle";
};

export const initialDeleteMemoState: DeleteMemoState = {
  message: "",
  status: "idle",
};

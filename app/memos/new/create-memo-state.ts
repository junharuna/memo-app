export type CreateMemoState = {
  fieldErrors: {
    content?: string;
    title?: string;
  };
  message: string;
  status: "error" | "idle" | "success";
  submissionId: number;
};

export const initialCreateMemoState: CreateMemoState = {
  fieldErrors: {},
  message: "",
  status: "idle",
  submissionId: 0,
};

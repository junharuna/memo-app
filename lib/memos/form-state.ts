export type MemoFormState = {
  fieldErrors: {
    content?: string;
    title?: string;
  };
  message: string;
  status: "error" | "idle" | "success";
  submissionId: number;
};

export const initialMemoFormState: MemoFormState = {
  fieldErrors: {},
  message: "",
  status: "idle",
  submissionId: 0,
};

export type MemoFieldErrors = {
    categoryId?: string;
    content?: string;
    tagIds?: string;
    title?: string;
};

export type MemoFormState = {
  fieldErrors: MemoFieldErrors;
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

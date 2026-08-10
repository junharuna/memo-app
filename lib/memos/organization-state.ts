export type OrganizationState = {
  fieldErrors: {
    colorKey?: string;
    name?: string;
  };
  message: string;
  status: "error" | "idle" | "success";
  submissionId: number;
};

export const initialOrganizationState: OrganizationState = {
  fieldErrors: {},
  message: "",
  status: "idle",
  submissionId: 0,
};

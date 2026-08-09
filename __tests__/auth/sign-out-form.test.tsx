import { fireEvent, render, screen } from "@testing-library/react";
import { signOutAction } from "../../app/auth/actions";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { ToastProvider } from "@/components/ui/toast";

jest.mock("../../app/auth/actions", () => ({
  signOutAction: jest.fn(),
}));

const mockSignOutAction = jest.mocked(signOutAction);

afterEach(() => {
  jest.clearAllMocks();
});

it("サインアウト失敗をトーストで通知する", async () => {
  mockSignOutAction.mockResolvedValue({
    message: "サインアウトできませんでした。時間をおいて、もう一度お試しください。",
  });
  render(
    <ToastProvider>
      <SignOutForm />
    </ToastProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "サインアウト" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "サインアウトできませんでした。時間をおいて、もう一度お試しください。",
  );
});

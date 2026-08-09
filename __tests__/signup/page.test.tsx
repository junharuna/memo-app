import { render, screen } from "@testing-library/react";
import SignupPage from "@/app/signup/page";
import { ToastProvider } from "@/components/ui/toast";

describe("SignupPage", () => {
  it("メールアドレスだけのサインアップ画面を表示する", () => {
    render(<ToastProvider><SignupPage /></ToastProvider>);

    expect(screen.getByRole("heading", { level: 1, name: "アカウントを作成" })).toBeInTheDocument();
    expect(screen.getByText("WELCOME TO TAGNOTE")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "メールアドレス" })).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.queryByLabelText("パスワード")).not.toBeInTheDocument();
  });
});

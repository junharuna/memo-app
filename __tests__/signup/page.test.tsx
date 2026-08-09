import { render, screen } from "@testing-library/react";
import SignupPage from "@/app/signup/page";

describe("SignupPage", () => {
  it("メールアドレスだけのサインアップ画面を表示する", () => {
    render(<SignupPage />);

    expect(screen.getByRole("heading", { level: 1, name: "アカウントを作成" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "メールアドレス" })).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.queryByLabelText("パスワード")).not.toBeInTheDocument();
  });
});

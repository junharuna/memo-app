import { render, screen } from "@testing-library/react";
import SigninPage from "@/app/signin/page";
import { ToastProvider } from "@/components/ui/toast";

it("メールアドレスだけのサインイン画面を表示する", async () => {
  render(<ToastProvider>{await SigninPage()}</ToastProvider>);

  expect(screen.getByRole("heading", { level: 1, name: "サインイン" })).toBeInTheDocument();
  expect(screen.getByText("WELCOME TO TAGNOTE")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "メールアドレス" })).toHaveAttribute(
    "type",
    "email",
  );
  expect(screen.queryByLabelText("パスワード")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "アカウントを作成" })).toHaveAttribute(
    "href",
    "/signup",
  );
});

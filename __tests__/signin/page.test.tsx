import { render, screen } from "@testing-library/react";
import SigninPage from "@/app/signin/page";

it("メールアドレスだけのサインイン画面を表示する", async () => {
  render(await SigninPage());

  expect(screen.getByRole("heading", { level: 1, name: "サインイン" })).toBeInTheDocument();
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

it("認証コールバックの失敗を通知する", async () => {
  render(await SigninPage({ searchParams: Promise.resolve({ error: "callback" }) }));

  expect(screen.getByRole("alert")).toHaveTextContent("認証リンクを確認できませんでした");
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "@/components/ui/toast";

function ToastTrigger() {
  const { showToast } = useToast();

  return (
    <button
      onClick={() => showToast({ message: "保存しました。", tone: "success" })}
      type="button"
    >
      通知する
    </button>
  );
}

afterEach(() => {
  window.history.replaceState({}, "", "/");
  jest.useRealTimers();
});

it("操作結果を一時的なトーストとして表示する", () => {
  jest.useFakeTimers();
  render(
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "通知する" }));
  expect(screen.getByRole("status")).toHaveTextContent("保存しました。");

  act(() => {
    jest.advanceTimersByTime(4_000);
  });

  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("リダイレクト結果を一度だけ通知し、URLから通知情報を除く", () => {
  window.history.replaceState({}, "", "/?view=favorites&toast=signed-out");

  render(<ToastProvider><div>コンテンツ</div></ToastProvider>);

  expect(screen.getByRole("status")).toHaveTextContent("サインアウトしました。");
  expect(window.location.pathname).toBe("/");
  expect(window.location.search).toBe("?view=favorites");
});

it("認証エラーを警告として通知する", () => {
  window.history.replaceState({}, "", "/signin?toast=auth-error");

  render(<ToastProvider><div>サインイン</div></ToastProvider>);

  expect(screen.getByRole("alert")).toHaveTextContent(
    "認証リンクを確認できませんでした。もう一度メールを送信してください。",
  );
});

it.each([
  ["signed-up", "サインアップしました。"],
  ["signed-in", "サインインしました。"],
  ["memo-updated", "メモを更新しました。"],
])("%s のリダイレクト結果を通知する", (toastKey, message) => {
  window.history.replaceState({}, "", `/?toast=${toastKey}`);

  render(<ToastProvider><div>ホーム</div></ToastProvider>);

  expect(screen.getByRole("status")).toHaveTextContent(message);
});

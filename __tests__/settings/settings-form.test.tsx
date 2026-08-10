import { fireEvent, render, screen } from "@testing-library/react";
import { SettingsForm } from "@/app/settings/settings-form";

jest.mock("../../app/settings/actions", () => ({
  saveSettingsAction: jest.fn(),
}));

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

it("表示名と3種類のテーマを初期表示する", () => {
  render(
    <SettingsForm
      preferences={{
        displayName: "表示名",
        email: "user@example.com",
        theme: "system",
      }}
    />,
  );

  expect(screen.getByRole("textbox", { name: "表示名" })).toHaveValue("表示名");
  expect(screen.getByRole("radio", { name: /システム設定/ })).toBeChecked();
  expect(screen.getByRole("radio", { name: /ライト/ })).not.toBeChecked();
  expect(screen.getByRole("radio", { name: /ダーク/ })).not.toBeChecked();
  expect(screen.getByRole("button", { name: "設定を保存" })).toBeInTheDocument();
});

it("テーマ選択をページ全体へすぐにプレビューする", () => {
  render(
    <SettingsForm
      preferences={{
        displayName: "表示名",
        email: "user@example.com",
        theme: "system",
      }}
    />,
  );

  fireEvent.click(screen.getByRole("radio", { name: /ダーク/ }));
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");

  fireEvent.click(screen.getByRole("radio", { name: /システム設定/ }));
  expect(document.documentElement).not.toHaveAttribute("data-theme");
});

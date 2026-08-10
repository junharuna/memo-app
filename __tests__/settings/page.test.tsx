import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import SettingsPage from "@/app/settings/page";
import { getPreferencesForCurrentUser } from "@/lib/settings/preferences";

jest.mock("next/navigation", () => ({
  redirect: jest.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
jest.mock("../../lib/settings/preferences", () => ({
  getPreferencesForCurrentUser: jest.fn(),
}));
jest.mock("../../app/settings/settings-form", () => ({
  SettingsForm: ({ preferences }: { preferences: { displayName: string } }) => (
    <p>設定フォーム: {preferences.displayName}</p>
  ),
}));

const mockGetPreferences = jest.mocked(getPreferencesForCurrentUser);

afterEach(() => {
  jest.clearAllMocks();
});

it("認証ユーザーのプロフィール設定を表示する", async () => {
  mockGetPreferences.mockResolvedValue({
    preferences: {
      displayName: "実ユーザー",
      email: "user@example.com",
      theme: "light",
    },
    status: "success",
  });

  render(await SettingsPage());

  expect(screen.getByRole("heading", { level: 1, name: "設定" })).toBeInTheDocument();
  expect(screen.getByText("user@example.com")).toBeInTheDocument();
  expect(screen.getByText("設定フォーム: 実ユーザー")).toBeInTheDocument();
});

it("未認証時はサインインへ移動し、取得失敗時は再試行を案内する", async () => {
  mockGetPreferences.mockResolvedValue({ status: "unauthenticated" });
  await expect(SettingsPage()).rejects.toThrow("redirect:/signin");
  expect(redirect).toHaveBeenCalledWith("/signin");

  mockGetPreferences.mockResolvedValue({ status: "error" });
  render(await SettingsPage());
  expect(screen.getByRole("alert")).toHaveTextContent("設定を読み込めませんでした");
  expect(screen.getByRole("link", { name: "もう一度試す" })).toHaveAttribute(
    "href",
    "/settings",
  );
});

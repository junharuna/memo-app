import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { AppShell } from "@/components/layout/app-shell";

jest.mock("../app/auth/actions", () => ({
  signOutAction: jest.fn(),
}));

function renderHome(isAuthenticated = false) {
  return render(
    <AppShell isAuthenticated={isAuthenticated}>
      <Home />
    </AppShell>,
  );
}

describe("Home", () => {
  it("renders the memo dashboard with its primary actions", () => {
    renderHome();

    expect(screen.getByRole("heading", { level: 1, name: "すべてのメモ" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "メモを検索" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "新しいメモを作成" })).not.toHaveLength(0);
    expect(screen.getByRole("navigation", { name: "メインナビゲーション" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Memora ホーム" })).not.toHaveLength(0);
    expect(screen.getByRole("link", { name: "サインアップ" })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "サインイン" })).toHaveAttribute("href", "/signin");
    expect(screen.queryByRole("button", { name: "サインアウト" })).not.toBeInTheDocument();
  });

  it("shows sign-out instead of sign-in links for an authenticated user", () => {
    renderHome(true);

    expect(screen.getByRole("button", { name: "サインアウト" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "サインイン" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "サインアップ" })).not.toBeInTheDocument();
  });

  it("renders useful starter content without requiring backend data", () => {
    renderHome();

    expect(screen.getByRole("heading", { level: 2, name: "最近のメモ" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("プロダクトアイデア")).toBeInTheDocument();
    expect(screen.getByText("デザインシステム")).toBeInTheDocument();
  });
});

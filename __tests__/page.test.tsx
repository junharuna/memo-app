import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { AppShell } from "@/components/layout/app-shell";

function renderHome() {
  return render(
    <AppShell>
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
  });

  it("renders useful starter content without requiring backend data", () => {
    renderHome();

    expect(screen.getByRole("heading", { level: 2, name: "最近のメモ" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("プロダクトアイデア")).toBeInTheDocument();
    expect(screen.getByText("デザインシステム")).toBeInTheDocument();
  });
});

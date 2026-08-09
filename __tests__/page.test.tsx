import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { AppShell } from "@/components/layout/app-shell";
import { getAuthState } from "@/lib/supabase/auth";

jest.mock("../app/auth/actions", () => ({
  signOutAction: jest.fn(),
}));

jest.mock("../lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getClaims: () => new Promise(() => undefined),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  }),
}));

jest.mock("../lib/supabase/auth", () => ({
  getAuthState: jest.fn(),
}));

const mockGetAuthState = jest.mocked(getAuthState);

async function renderHome(isAuthenticated = false) {
  mockGetAuthState.mockResolvedValue({ isAuthenticated });
  const page = await Home();

  return render(
    <AppShell isAuthenticated={isAuthenticated}>
      {page}
    </AppShell>,
  );
}

describe("Home", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("未ログイン時は機能紹介と認証導線を表示し、メモ機能を表示しない", async () => {
    await renderHome();

    expect(
      screen.getByRole("heading", { level: 1, name: /考えを残して、\s*タグですぐ見つける。/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "書くことに集中し、あとから整える。" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "サインイン" })).not.toHaveLength(0);
    expect(screen.getAllByRole("link", { name: "アカウントを作成" })).not.toHaveLength(0);

    expect(screen.queryByRole("heading", { level: 1, name: "すべてのメモ" })).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox", { name: "メモを検索" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "新しいメモを作成" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "メインナビゲーション" })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("ログイン済みならメモダッシュボードと主要操作を表示する", async () => {
    await renderHome(true);

    expect(screen.getByRole("heading", { level: 1, name: "すべてのメモ" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "メモを検索" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "新しいメモを作成" })).not.toHaveLength(0);
    expect(screen.getByRole("navigation", { name: "メインナビゲーション" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "TagNote ホーム" })).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: "サインアウト" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "サインイン" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "サインアップ" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "最近のメモ" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("プロダクトアイデア")).toBeInTheDocument();
    expect(screen.getByText("デザインシステム")).toBeInTheDocument();
  });
});

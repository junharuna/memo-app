import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { AppShell } from "@/components/layout/app-shell";
import { listOrganizationForCurrentUser } from "@/lib/memos/organization-queries";
import { listMemosForCurrentUser } from "@/lib/memos/queries";
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

jest.mock("../lib/memos/queries", () => ({
  listMemosForCurrentUser: jest.fn(),
}));
jest.mock("../lib/memos/organization-queries", () => ({
  listOrganizationForCurrentUser: jest.fn(),
}));

const mockGetAuthState = jest.mocked(getAuthState);
const mockListMemos = jest.mocked(listMemosForCurrentUser);
const mockListOrganization = jest.mocked(listOrganizationForCurrentUser);

const storedCategories = [
  {
    colorKey: "blue" as const,
    id: "55555555-5555-4555-8555-555555555555",
    memoCount: 2,
    name: "実データカテゴリ",
  },
];

const storedMemos = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Supabaseのメモ",
    content: "# 本文\n\n**保存済み**の内容",
    created_at: "2026-08-09T01:00:00.000Z",
    updated_at: "2026-08-09T02:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "2件目のメモ",
    content: "チェックリスト\n\n- [ ] 確認する",
    created_at: "2026-08-08T01:00:00.000Z",
    updated_at: "2026-08-08T02:00:00.000Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "3件目のメモ",
    content: "3件目の本文",
    created_at: "2026-08-07T01:00:00.000Z",
    updated_at: "2026-08-07T02:00:00.000Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "4件目のメモ",
    content: "ホームには表示されない本文",
    created_at: "2026-08-06T01:00:00.000Z",
    updated_at: "2026-08-06T02:00:00.000Z",
  },
];

async function renderHome(isAuthenticated = false) {
  mockGetAuthState.mockResolvedValue({ isAuthenticated });
  mockListMemos.mockResolvedValue({
    status: "success",
    memos: storedMemos.slice(0, 3),
  });
  mockListOrganization.mockResolvedValue({
    categories: storedCategories,
    status: "success",
    tags: [],
  });
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
    expect(screen.queryByRole("searchbox", { name: "メモの本文を検索" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "新しいメモを作成" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "メインナビゲーション" })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("ログイン済みならメモダッシュボードと主要操作を表示する", async () => {
    await renderHome(true);

    expect(screen.getByRole("heading", { level: 1, name: "ホーム" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "メモの本文を検索" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "タグ" })).toHaveAttribute("href", "/tags");
    expect(screen.getAllByRole("link", { name: "新しいメモを作成" })).not.toHaveLength(0);
    expect(screen.getByRole("navigation", { name: "メインナビゲーション" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "TagNote ホーム" })).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: "サインアウト" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "サインイン" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "サインアップ" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "最近のメモ" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "すべてのメモを表示" })).toHaveAttribute(
      "href",
      "/memos",
    );
    expect(screen.getByRole("link", { name: "Supabaseのメモを開く" })).toHaveAttribute(
      "href",
      "/memos/11111111-1111-4111-8111-111111111111",
    );
    expect(screen.getByText("2件目のメモ")).toBeInTheDocument();
    expect(screen.getByText("3件目のメモ")).toBeInTheDocument();
    expect(screen.queryByText("4件目のメモ")).not.toBeInTheDocument();
    expect(screen.getByText("本文 保存済みの内容")).toBeInTheDocument();
    expect(screen.getByText("チェックリスト 確認する")).toBeInTheDocument();
    expect(document.querySelector(".markdown-preview")).not.toBeInTheDocument();
    expect(document.querySelector("article strong")).not.toBeInTheDocument();
    expect(document.querySelector("article ul")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByText("プロダクトアイデア")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "実データカテゴリ 2件のメモ" })).toHaveAttribute(
      "href",
      "/memos?category=55555555-5555-4555-8555-555555555555",
    );
    expect(screen.queryByText("仕事")).not.toBeInTheDocument();
    expect(mockListMemos).toHaveBeenCalledWith({ limit: 3 });
  });

  it("保存済みメモがない場合は作成導線付きの空状態を表示する", async () => {
    mockGetAuthState.mockResolvedValue({ isAuthenticated: true });
    mockListMemos.mockResolvedValue({ status: "success", memos: [] });

    render(await Home());

    expect(screen.getByRole("heading", { name: "まだメモがありません" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "最初のメモを作成" })).toHaveAttribute(
      "href",
      "/memos/new",
    );
  });

  it("メモ取得に失敗した場合は再試行できるエラー状態を表示する", async () => {
    mockGetAuthState.mockResolvedValue({ isAuthenticated: true });
    mockListMemos.mockResolvedValue({ status: "error" });

    render(await Home());

    expect(screen.getByRole("alert")).toHaveTextContent("メモを読み込めませんでした");
    expect(screen.getByRole("link", { name: "もう一度試す" })).toHaveAttribute("href", "/");
  });
});

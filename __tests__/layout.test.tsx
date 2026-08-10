import RootLayout from "../app/layout";
import { listOrganizationForCurrentUser } from "../lib/memos/organization-queries";
import { getPreferencesForCurrentUser } from "../lib/settings/preferences";
import { getAuthState } from "../lib/supabase/auth";

jest.mock("../lib/supabase/auth", () => ({
  getAuthState: jest.fn(),
}));
jest.mock("../lib/memos/organization-queries", () => ({
  listOrganizationForCurrentUser: jest.fn(),
}));
jest.mock("../lib/settings/preferences", () => ({
  getPreferencesForCurrentUser: jest.fn(),
}));

jest.mock("../components/layout/app-shell", () => ({
  AppShell: ({
    children,
    profile,
  }: {
    children: React.ReactNode;
    profile?: { displayName: string };
  }) => (
    <>
      {profile && <p>シェルプロフィール: {profile.displayName}</p>}
      {children}
    </>
  ),
}));

const mockGetAuthState = jest.mocked(getAuthState);
const mockListOrganization = jest.mocked(listOrganizationForCurrentUser);
const mockGetPreferences = jest.mocked(getPreferencesForCurrentUser);

it("ルート遷移時にsmooth scrollを一時解除する意図をNext.jsへ伝える", async () => {
  mockGetAuthState.mockResolvedValue({ isAuthenticated: false });

  const layout = await RootLayout({ children: <p>本文</p> });
  const htmlProps = layout.props as Record<string, unknown>;

  expect(htmlProps["data-scroll-behavior"]).toBe("smooth");
});

it("認証ユーザーの保存テーマとプロフィールを初回描画へ反映する", async () => {
  mockGetAuthState.mockResolvedValue({ isAuthenticated: true });
  mockListOrganization.mockResolvedValue({
    categories: [],
    status: "success",
    tags: [],
  });
  mockGetPreferences.mockResolvedValue({
    preferences: {
      displayName: "保存済み表示名",
      email: "user@example.com",
      theme: "dark",
    },
    status: "success",
  });

  const layout = await RootLayout({ children: <p>本文</p> });

  expect(layout.props["data-theme"]).toBe("dark");
  expect(layout.props.children.props.children).toEqual(
    expect.objectContaining({
      props: expect.objectContaining({
        profile: expect.objectContaining({ displayName: "保存済み表示名" }),
      }),
    }),
  );
});

import RootLayout from "../app/layout";
import { getAuthState } from "../lib/supabase/auth";

jest.mock("../lib/supabase/auth", () => ({
  getAuthState: jest.fn(),
}));

jest.mock("../components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => children,
}));

const mockGetAuthState = jest.mocked(getAuthState);

it("ルート遷移時にsmooth scrollを一時解除する意図をNext.jsへ伝える", async () => {
  mockGetAuthState.mockResolvedValue({ isAuthenticated: false });

  const layout = await RootLayout({ children: <p>本文</p> });
  const htmlProps = layout.props as Record<string, unknown>;

  expect(htmlProps["data-scroll-behavior"]).toBe("smooth");
});

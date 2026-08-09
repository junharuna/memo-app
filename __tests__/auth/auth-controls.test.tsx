import { createBrowserClient } from "@supabase/ssr";
import { act, render, screen } from "@testing-library/react";
import { AuthControls } from "@/components/auth/auth-controls";
import { ToastProvider } from "@/components/ui/toast";

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(),
}));

jest.mock("../../app/auth/actions", () => ({
  signOutAction: jest.fn(),
}));

const mockCreateBrowserClient = jest.mocked(createBrowserClient);
const mockGetClaims = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockUnsubscribe = jest.fn();

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";
  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-id" } },
    error: null,
  });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
  mockCreateBrowserClient.mockReturnValue({
    auth: {
      getClaims: mockGetClaims,
      onAuthStateChange: mockOnAuthStateChange,
    },
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

it("サーバー表示が匿名でもブラウザに有効なセッションがあればサインアウトへ切り替える", async () => {
  render(
    <ToastProvider>
      <AuthControls initialIsAuthenticated={false} />
    </ToastProvider>,
  );

  expect(screen.getByRole("link", { name: "サインイン" })).toBeInTheDocument();
  expect(await screen.findByRole("button", { name: "サインアウト" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "サインイン" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "サインアップ" })).not.toBeInTheDocument();
});

it("サインアウトイベントを受けたら匿名用リンクへ切り替える", async () => {
  let authStateCallback: ((event: string, session: null) => void) | undefined;
  mockOnAuthStateChange.mockImplementation((callback) => {
    authStateCallback = callback;
    return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
  });
  render(
    <ToastProvider>
      <AuthControls initialIsAuthenticated />
    </ToastProvider>,
  );
  expect(await screen.findByRole("button", { name: "サインアウト" })).toBeInTheDocument();

  act(() => {
    authStateCallback?.("SIGNED_OUT", null);
  });

  expect(screen.getByRole("link", { name: "サインイン" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "サインアップ" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "サインアウト" })).not.toBeInTheDocument();
});

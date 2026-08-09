import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createBrowserClient } from "@supabase/ssr";
import { SignupForm } from "@/app/signup/signup-form";
import { ToastProvider } from "@/components/ui/toast";

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(),
}));

const mockCreateBrowserClient = jest.mocked(createBrowserClient);
const mockSignInWithOtp = jest.fn();

function renderSignupForm() {
  return render(
    <ToastProvider>
      <SignupForm />
    </ToastProvider>,
  );
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";
  mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });
  mockCreateBrowserClient.mockReturnValue({
    auth: { signInWithOtp: mockSignInWithOtp },
  } as never);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("SignupForm", () => {
  it("メールアドレスだけでサインアップ用メールを送信する", async () => {
    renderSignupForm();

    fireEvent.change(screen.getByRole("textbox", { name: "メールアドレス" }), {
      target: { value: "  user@example.com  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "確認メールを送信" }));

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: "user@example.com",
        options: {
          emailRedirectTo: "http://localhost/auth/callback?next=%2F%3Ftoast%3Dsigned-up",
          shouldCreateUser: true,
        },
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent("確認メールを送信しました");
  });

  it("不正なメールアドレスはSupabaseへ送信しない", async () => {
    renderSignupForm();

    const emailInput = screen.getByRole("textbox", { name: "メールアドレス" });
    fireEvent.change(emailInput, { target: { value: "invalid-address" } });
    fireEvent.submit(emailInput.closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "有効なメールアドレスを入力してください",
    );
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it("Supabaseの送信失敗を利用者へ通知する", async () => {
    mockSignInWithOtp.mockResolvedValue({
      data: {},
      error: new Error("rate limit exceeded"),
    });
    renderSignupForm();

    fireEvent.change(screen.getByRole("textbox", { name: "メールアドレス" }), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "確認メールを送信" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "確認メールを送信できませんでした。時間をおいて、もう一度お試しください。",
    );
  });

  it("ネットワーク例外を利用者へ通知する", async () => {
    mockSignInWithOtp.mockRejectedValue(new Error("network unavailable"));
    renderSignupForm();

    fireEvent.change(screen.getByRole("textbox", { name: "メールアドレス" }), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "確認メールを送信" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "確認メールを送信できませんでした。時間をおいて、もう一度お試しください。",
    );
  });
});

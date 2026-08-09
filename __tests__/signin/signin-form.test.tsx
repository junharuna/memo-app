import { createBrowserClient } from "@supabase/ssr";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SigninForm } from "@/app/signin/signin-form";

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(),
}));

const mockCreateBrowserClient = jest.mocked(createBrowserClient);
const mockSignInWithOtp = jest.fn();

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

it("既存ユーザーだけにサインイン用メールを送信する", async () => {
  render(<SigninForm />);

  fireEvent.change(screen.getByRole("textbox", { name: "メールアドレス" }), {
    target: { value: "user@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "サインインメールを送信" }));

  await waitFor(() => {
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "user@example.com",
      options: {
        emailRedirectTo: "http://localhost/auth/callback",
        shouldCreateUser: false,
      },
    });
  });
  expect(screen.getByRole("status")).toHaveTextContent("サインインメールを送信しました");
});

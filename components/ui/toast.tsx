"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import { Icon } from "@/components/ui/icon";

type ToastTone = "error" | "success";

type ToastInput = {
  message: string;
  tone: ToastTone;
};

type ToastState = ToastInput & {
  id: number;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const TOAST_DURATION_MS = 4_000;

const redirectToasts = {
  "auth-error": {
    message: "認証リンクを確認できませんでした。もう一度メールを送信してください。",
    tone: "error",
  },
  "signed-in": {
    message: "サインインしました。",
    tone: "success",
  },
  "memo-updated": {
    message: "メモを更新しました。",
    tone: "success",
  },
  "signed-out": {
    message: "サインアウトしました。",
    tone: "success",
  },
  "signed-up": {
    message: "サインアップしました。",
    tone: "success",
  },
} satisfies Record<string, ToastInput>;

const ToastContext = createContext<ToastContextValue | null>(null);

function isRedirectToast(value: string): value is keyof typeof redirectToasts {
  return value in redirectToasts;
}

function RedirectToastListener({
  showToast,
}: {
  showToast: (toast: ToastInput) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const toastKey = currentUrl.searchParams.get("toast");

    if (!toastKey || !isRedirectToast(toastKey)) {
      return;
    }

    currentUrl.searchParams.delete("toast");
    const nextUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

    showToast(redirectToasts[toastKey]);
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [pathname, search, showToast]);

  return null;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback((input: ToastInput) => {
    nextId.current += 1;
    setToast({ ...input, id: nextId.current });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((currentToast) => currentToast?.id === toast.id ? null : currentToast);
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Suspense fallback={null}>
        <RedirectToastListener showToast={showToast} />
      </Suspense>
      {toast && (
        <div
          aria-atomic="true"
          className={`fixed inset-x-4 top-20 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl border bg-[var(--surface-raised)] px-4 py-3 text-sm leading-6 shadow-[0_14px_44px_rgba(22,26,35,0.18)] sm:left-auto sm:right-6 sm:top-24 sm:mx-0 ${
            toast.tone === "success"
              ? "border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
              : "border-red-500/25 text-red-700 dark:text-red-300"
          }`}
          role={toast.tone === "error" ? "alert" : "status"}
        >
          <Icon
            className="mt-0.5 shrink-0"
            name={toast.tone === "success" ? "check" : "circleAlert"}
            size={19}
          />
          <p className="min-w-0 flex-1 text-[var(--ink)]">{toast.message}</p>
          <button
            aria-label="通知を閉じる"
            className="-my-1 -mr-1 flex size-10 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--nav-hover)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            onClick={() => setToast(null)}
            type="button"
          >
            <Icon name="x" size={17} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}

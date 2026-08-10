import Link from "next/link";
import type { ReactNode } from "react";
import { AuthControls } from "@/components/auth/auth-controls";
import { NavigationLink } from "@/components/layout/navigation-link";
import { Icon, type IconName } from "@/components/ui/icon";
import { ToastProvider } from "@/components/ui/toast";
import { getCategoryColorPresentation } from "@/lib/memos/category-colors";
import type { CategoryRecord } from "@/lib/memos/organization-queries";
import type { UserPreferences } from "@/lib/settings/preferences";

type AppShellProps = {
  categories?: CategoryRecord[];
  children: ReactNode;
  isAuthenticated?: boolean;
  profile?: Pick<UserPreferences, "displayName" | "email">;
};

type NavigationItem = {
  activePath?: string;
  activeView?: "active" | "archive" | "favorites" | "trash";
  icon: IconName;
  label: string;
  href: string;
};

const navigationItems: NavigationItem[] = [
  { activePath: "/memos", activeView: "active", icon: "inbox", label: "すべてのメモ", href: "/memos" },
  { activePath: "/memos", activeView: "favorites", icon: "star", label: "お気に入り", href: "/memos?view=favorites" },
  { activePath: "/tags", icon: "tag", label: "タグ", href: "/tags" },
  { activePath: "/memos", activeView: "archive", icon: "archive", label: "アーカイブ", href: "/memos?view=archive" },
  { activePath: "/memos", activeView: "trash", icon: "trash", label: "ゴミ箱", href: "/memos?view=trash" },
];

function Brand() {
  return (
    <Link
      className="group flex w-fit items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
      href="/"
      aria-label="TagNote ホーム"
    >
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="text-[19px] font-semibold tracking-[-0.045em] text-[var(--ink)]">
        TagNote
      </span>
    </Link>
  );
}

function NewMemoButton({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      aria-label="新しいメモを作成"
      className={
        compact
          ? "flex size-10 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--surface)] shadow-[0_5px_18px_rgba(22,26,35,0.18)] transition hover:scale-[1.04] active:scale-95"
          : "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-[var(--surface)] shadow-[0_8px_24px_rgba(22,26,35,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(22,26,35,0.18)] active:translate-y-0"
      }
      href="/memos/new"
    >
      <Icon name="plus" size={compact ? 19 : 18} />
      {!compact && <span>新しいメモ</span>}
    </Link>
  );
}

function Sidebar({
  categories,
  profile,
}: {
  categories: CategoryRecord[];
  profile?: Pick<UserPreferences, "displayName" | "email">;
}) {
  const displayName = profile?.displayName || "ユーザー";
  const avatarLabel = Array.from(displayName)[0] ?? "U";
  return (
    <aside className="hidden w-[272px] shrink-0 border-r border-[var(--hairline)] bg-[var(--sidebar)] lg:flex lg:flex-col">
      <div className="flex h-20 items-center px-7">
        <Brand />
      </div>

      <div className="px-5 pb-5 pt-2">
        <NewMemoButton />
      </div>

      <nav className="px-3" aria-label="メインナビゲーション">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.label}>
              <NavigationLink {...item} variant="desktop" />
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 px-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--muted-soft)] uppercase">
            カテゴリ
          </p>
          <Link
            aria-label="カテゴリを管理"
            className="flex size-7 items-center justify-center rounded-lg text-[var(--muted-soft)] transition hover:bg-[var(--nav-hover)] hover:text-[var(--ink)]"
            href="/categories"
          >
            <Icon name="plus" size={15} />
          </Link>
        </div>
        {categories.length > 0 ? (
          <ul className="space-y-0.5">
            {categories.map((category) => (
            <li key={category.id}>
              <Link
                className="flex h-9 items-center gap-3 rounded-lg px-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--nav-hover)] hover:text-[var(--ink)]"
                href={`/memos?category=${category.id}`}
              >
                <span
                  className="size-2 rounded-full"
                  aria-hidden="true"
                  data-category-color={category.colorKey}
                  style={{
                    backgroundColor: getCategoryColorPresentation(
                      category.colorKey,
                    ).value,
                  }}
                />
                <span className="min-w-0 flex-1 truncate">{category.name}</span>
                <span className="text-[10px] tabular-nums text-[var(--muted-soft)]">
                  {category.memoCount}
                </span>
              </Link>
            </li>
          ))}
          </ul>
        ) : (
          <Link
            className="flex min-h-9 items-center rounded-lg px-2 text-xs font-medium text-[var(--muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--ink)]"
            href="/categories"
          >
            カテゴリを作成
          </Link>
        )}
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-raised)] p-3.5 shadow-[0_1px_1px_rgba(22,26,35,0.02)]">
          <div className="flex items-center gap-3">
            <span className="avatar" aria-hidden="true">{avatarLabel}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--ink)]">{displayName}</span>
              {profile?.email && (
                <span className="block truncate text-[11px] text-[var(--muted-soft)]">{profile.email}</span>
              )}
            </span>
            <Link
              aria-label="設定を開く"
              className="rounded-lg p-1 text-[var(--muted-soft)] hover:bg-[var(--nav-hover)] hover:text-[var(--ink)]"
              href="/settings"
            >
              <Icon name="moreHorizontal" size={17} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--hairline)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-8 xl:px-10">
        <div className="flex lg:hidden">
          <Brand />
        </div>

        <form action="/memos" className="search-field ml-auto lg:ml-0" role="search">
          <Icon className="shrink-0 text-[var(--muted-soft)]" name="search" size={18} />
          <input
            aria-label="メモの本文を検索"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted-soft)]"
            name="q"
            placeholder="メモの本文を検索"
            type="search"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              aria-label="設定を開く"
              className="header-icon-button"
              href="/settings"
            >
              <Icon name="settings" size={19} />
            </Link>
          </div>
          <AuthControls
            initialIsAuthenticated
          />
          <div className="sm:hidden">
            <NewMemoButton compact />
          </div>
        </div>
      </div>
    </header>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--hairline)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-8 xl:px-10">
        <Brand />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <AuthControls initialIsAuthenticated={false} />
        </div>
      </div>
    </header>
  );
}

function MobileNavigation() {
  const mobileItems: NavigationItem[] = [
    navigationItems[0],
    navigationItems[1],
    { activePath: "/categories", icon: "folder", label: "カテゴリ", href: "/categories" },
    { activePath: "/settings", icon: "settings", label: "設定", href: "/settings" },
  ];

  return (
    <nav
      aria-label="モバイルナビゲーション"
      className="fixed inset-x-3 bottom-3 z-40 rounded-[22px] border border-white/60 bg-[color-mix(in_srgb,var(--sidebar)_88%,transparent)] p-1.5 shadow-[0_14px_44px_rgba(22,26,35,0.18)] backdrop-blur-2xl lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {mobileItems.map((item) => (
          <li key={item.label}>
            <NavigationLink {...item} variant="mobile" />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppShell({
  categories = [],
  children,
  isAuthenticated = false,
  profile,
}: AppShellProps) {
  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <div className="min-h-dvh bg-[var(--surface)]">
          <a className="skip-link" href="#main-content">
            メインコンテンツへ移動
          </a>
          <PublicHeader />
          <main id="main-content">{children}</main>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-dvh bg-[var(--surface)]">
        <a className="skip-link" href="#main-content">
          メインコンテンツへ移動
        </a>
        <Sidebar categories={categories} profile={profile} />
        <div className="min-w-0 flex-1">
          <Header />
          <main id="main-content" className="pb-24 lg:pb-0">
            {children}
          </main>
        </div>
        <MobileNavigation />
      </div>
    </ToastProvider>
  );
}

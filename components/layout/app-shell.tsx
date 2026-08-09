import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { Icon, type IconName } from "@/components/ui/icon";

type AppShellProps = {
  children: ReactNode;
  isAuthenticated?: boolean;
};

type NavigationItem = {
  icon: IconName;
  label: string;
  href: string;
  count?: number;
  active?: boolean;
};

const navigationItems: NavigationItem[] = [
  { icon: "inbox", label: "すべてのメモ", href: "/", count: 24, active: true },
  { icon: "star", label: "お気に入り", href: "/?view=favorites", count: 6 },
  { icon: "tag", label: "タグ", href: "/?view=tags" },
  { icon: "archive", label: "アーカイブ", href: "/?view=archive" },
  { icon: "trash", label: "ゴミ箱", href: "/?view=trash" },
];

const folders = [
  { label: "仕事", color: "bg-[#5e8bff]" },
  { label: "個人", color: "bg-[#ff9f56]" },
  { label: "アイデア", color: "bg-[#a67cf7]" },
];

function Brand() {
  return (
    <Link
      className="group flex w-fit items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
      href="/"
      aria-label="Memora ホーム"
    >
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="text-[19px] font-semibold tracking-[-0.045em] text-[var(--ink)]">
        Memora
      </span>
    </Link>
  );
}

function NewMemoButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      aria-label="新しいメモを作成"
      className={
        compact
          ? "flex size-10 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--surface)] shadow-[0_5px_18px_rgba(22,26,35,0.18)] transition hover:scale-[1.04] active:scale-95"
          : "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-[var(--surface)] shadow-[0_8px_24px_rgba(22,26,35,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(22,26,35,0.18)] active:translate-y-0"
      }
      type="button"
    >
      <Icon name="plus" size={compact ? 19 : 18} />
      {!compact && <span>新しいメモ</span>}
    </button>
  );
}

function Sidebar() {
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
              <Link
                aria-current={item.active ? "page" : undefined}
                className={`group flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm transition-colors ${
                  item.active
                    ? "bg-[var(--nav-active)] font-semibold text-[var(--ink)]"
                    : "font-medium text-[var(--muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--ink)]"
                }`}
                href={item.href}
              >
                <Icon
                  className={item.active ? "text-blue-600" : "text-[var(--muted-soft)] group-hover:text-[var(--ink)]"}
                  name={item.icon}
                  size={18}
                />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="ml-auto text-xs font-medium tabular-nums text-[var(--muted-soft)]">
                    {item.count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 px-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--muted-soft)] uppercase">
            カテゴリ
          </p>
          <button
            aria-label="カテゴリを追加"
            className="flex size-7 items-center justify-center rounded-lg text-[var(--muted-soft)] transition hover:bg-[var(--nav-hover)] hover:text-[var(--ink)]"
            type="button"
          >
            <Icon name="plus" size={15} />
          </button>
        </div>
        <ul className="space-y-0.5">
          {folders.map((folder) => (
            <li key={folder.label}>
              <Link
                className="flex h-9 items-center gap-3 rounded-lg px-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--nav-hover)] hover:text-[var(--ink)]"
                href={`/#category-${folder.label}`}
              >
                <span className={`size-2 rounded-full ${folder.color}`} aria-hidden="true" />
                {folder.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-raised)] p-3.5 shadow-[0_1px_1px_rgba(22,26,35,0.02)]">
          <div className="flex items-center gap-3">
            <span className="avatar">H</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--ink)]">Haruna</span>
              <span className="block truncate text-[11px] text-[var(--muted-soft)]">Personal plan</span>
            </span>
            <button
              aria-label="アカウントメニューを開く"
              className="rounded-lg p-1 text-[var(--muted-soft)] hover:bg-[var(--nav-hover)] hover:text-[var(--ink)]"
              type="button"
            >
              <Icon name="moreHorizontal" size={17} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--hairline)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-8 xl:px-10">
        <div className="flex lg:hidden">
          <Brand />
        </div>

        <label className="search-field ml-auto lg:ml-0">
          <Icon className="shrink-0 text-[var(--muted-soft)]" name="search" size={18} />
          <input
            aria-label="メモを検索"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted-soft)]"
            placeholder="メモを検索"
            type="search"
          />
          <kbd className="hidden rounded-md border border-[var(--hairline)] bg-[var(--surface-raised)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-soft)] sm:inline">
            ⌘ K
          </kbd>
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <button
              aria-label="通知を見る"
              className="header-icon-button"
              type="button"
            >
              <Icon name="bell" size={19} />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-blue-600 ring-2 ring-[var(--surface)]" />
            </button>
            <button
              aria-label="設定を開く"
              className="header-icon-button"
              type="button"
            >
              <Icon name="settings" size={19} />
            </button>
          </div>
          {isAuthenticated ? (
            <SignOutForm />
          ) : (
            <>
              <Link
                aria-label="サインイン"
                className="secondary-button size-10 px-0 sm:w-auto sm:px-3"
                href="/signin"
              >
                <Icon name="user" size={18} />
                <span className="hidden sm:inline">サインイン</span>
              </Link>
              <Link
                aria-label="サインアップ"
                className="primary-button size-10 whitespace-nowrap px-0 sm:w-auto sm:px-4"
                href="/signup"
              >
                <Icon name="userPlus" size={18} />
                <span className="hidden sm:inline">サインアップ</span>
              </Link>
            </>
          )}
          <div className="sm:hidden">
            <NewMemoButton compact />
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNavigation() {
  const mobileItems: NavigationItem[] = [
    navigationItems[0],
    navigationItems[1],
    { icon: "folder", label: "カテゴリ", href: "/#categories" },
    { icon: "settings", label: "設定", href: "/?view=settings" },
  ];

  return (
    <nav
      aria-label="モバイルナビゲーション"
      className="fixed inset-x-3 bottom-3 z-40 rounded-[22px] border border-white/60 bg-[color-mix(in_srgb,var(--sidebar)_88%,transparent)] p-1.5 shadow-[0_14px_44px_rgba(22,26,35,0.18)] backdrop-blur-2xl lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {mobileItems.map((item) => (
          <li key={item.label}>
            <Link
              aria-current={item.active ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-medium ${
                item.active ? "bg-[var(--surface-raised)] text-blue-600 shadow-sm" : "text-[var(--muted)]"
              }`}
              href={item.href}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppShell({ children, isAuthenticated = false }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-[var(--surface)]">
      <a className="skip-link" href="#main-content">
        メインコンテンツへ移動
      </a>
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header isAuthenticated={isAuthenticated} />
        <main id="main-content" className="pb-24 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}

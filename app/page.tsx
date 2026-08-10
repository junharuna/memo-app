import Link from "next/link";
import { redirect } from "next/navigation";
import { MemoList } from "@/components/memos/memo-list";
import { Icon, type IconName } from "@/components/ui/icon";
import { getCategoryColorPresentation } from "@/lib/memos/category-colors";
import {
  type OrganizationResult,
  listOrganizationForCurrentUser,
} from "@/lib/memos/organization-queries";
import {
  type MemoListResult,
  listMemosForCurrentUser,
} from "@/lib/memos/queries";
import { getAuthState } from "@/lib/supabase/auth";

const RECENT_MEMO_LIMIT = 3;

const publicFeatures: Array<{
  description: string;
  icon: IconName;
  title: string;
}> = [
  {
    title: "Markdownで書く",
    description: "思いついた瞬間に、書式を気にしすぎず軽やかに記録できます。",
    icon: "fileText",
  },
  {
    title: "タグで整える",
    description: "カテゴリとタグを使って、増えていくメモを自分らしく整理できます。",
    icon: "tag",
  },
  {
    title: "すぐに見つける",
    description: "検索や絞り込みから、必要な言葉やアイデアへ素早く戻れます。",
    icon: "search",
  },
];

function PublicHome() {
  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20 xl:px-10">
      <section className="relative overflow-hidden rounded-[26px] border border-[var(--hairline)] bg-[var(--surface-raised)] px-5 py-12 shadow-[0_2px_3px_rgba(20,24,31,0.02),0_20px_50px_rgba(20,24,31,0.04)] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="relative z-10 max-w-3xl">
          <p className="eyebrow">YOUR NOTES, IN ORDER</p>
          <h1 className="mt-4 text-[clamp(2.5rem,8vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.07em] text-[var(--ink)]">
            考えを残して、
            <br />
            タグですぐ見つける。
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[var(--muted)] sm:text-[17px] sm:leading-8">
            TagNoteは、Markdownメモをカテゴリとタグで整理できる、シンプルなノートアプリです。
            書き留めたアイデアを、必要なときに迷わず取り出せます。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link className="primary-button h-11 px-5" href="/signup">
              <Icon name="userPlus" size={18} />
              アカウントを作成
            </Link>
            <Link className="secondary-button h-11 px-5" href="/signin">
              <Icon name="user" size={18} />
              サインイン
            </Link>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted-soft)]">
            メモの作成・閲覧・検索にはサインインが必要です。
          </p>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 right-[18%] size-72 rounded-full bg-violet-500/10 blur-3xl" aria-hidden="true" />
      </section>

      <section className="mt-14 sm:mt-20" aria-labelledby="features-title">
        <div className="max-w-2xl">
          <p className="eyebrow">WHAT YOU CAN DO</p>
          <h2
            className="mt-3 text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-tight tracking-[-0.055em] text-[var(--ink)]"
            id="features-title"
          >
            書くことに集中し、あとから整える。
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-[15px]">
            記録、整理、発見までをひとつの場所で。日々の小さな気づきから、育てたいアイデアまで扱えます。
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {publicFeatures.map((feature, index) => (
            <div
              className="rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-5 shadow-[0_2px_3px_rgba(20,24,31,0.02),0_12px_30px_rgba(20,24,31,0.025)] sm:p-6"
              key={feature.title}
            >
              <span
                className={`memo-icon ${index === 0 ? "memo-accent-blue" : index === 1 ? "memo-accent-violet" : "memo-accent-orange"}`}
                aria-hidden="true"
              >
                <Icon name={feature.icon} size={20} />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.025em] text-[var(--ink)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="start-title"
        className="mt-14 flex flex-col gap-6 rounded-[24px] border border-[var(--hairline)] bg-[var(--sidebar)] p-6 sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.045em] text-[var(--ink)]" id="start-title">
            あなたのメモを、ひとつの場所へ。
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            メールアドレスだけで、すぐに始められます。
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link className="secondary-button h-11 px-5" href="/signin">
            サインイン
          </Link>
          <Link className="primary-button h-11 px-5" href="/signup">
            アカウントを作成
            <Icon name="chevronRight" size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function PageHeading() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">YOUR HOME</p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">
          ホーム
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">
          大切な考えを、いつでも見つけられる場所に。
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="メモの表示方法を変更"
          className="secondary-button"
          type="button"
        >
          <Icon name="grid" size={17} />
          <span className="hidden sm:inline">グリッド</span>
        </button>
        <Link
          aria-label="新しいメモを作成"
          className="primary-button"
          href="/memos/new"
        >
          <Icon name="plus" size={18} />
          新しいメモ
        </Link>
      </div>
    </div>
  );
}

function Overview() {
  return (
    <section className="overview-card mt-8 overflow-hidden" aria-labelledby="overview-title">
      <div className="relative z-10 max-w-lg p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#315fc3] shadow-sm backdrop-blur-md">
          <Icon name="sparkles" size={13} />
          QUICK CAPTURE
        </span>
        <h2 id="overview-title" className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#172345] sm:text-[28px]">
          浮かんだことを、そのまま。
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#52607d] sm:text-[15px]">
          マークダウンで軽やかに書き始めて、カテゴリやタグはあとから整えられます。
        </p>
        <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2457c6] transition hover:gap-3" type="button">
          クイックメモを開く
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
      <div className="overview-art" aria-hidden="true">
        <span className="overview-orb overview-orb-one" />
        <span className="overview-orb overview-orb-two" />
        <span className="floating-note floating-note-back">
          <span />
          <span />
          <span />
        </span>
        <span className="floating-note floating-note-front">
          <span className="floating-note-title" />
          <span />
          <span />
          <span className="floating-note-short" />
        </span>
      </div>
    </section>
  );
}

function RecentMemos({ result }: { result: Exclude<MemoListResult, { status: "unauthenticated" }> }) {
  return (
    <section className="mt-11" aria-labelledby="recent-title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="recent-title" className="section-title">最近のメモ</h2>
        <Link
          aria-label="すべてのメモを表示"
          className="text-button"
          href="/memos"
        >
          すべて表示
          <Icon name="chevronRight" size={15} />
        </Link>
      </div>
      <MemoList result={result} retryHref="/" />
    </section>
  );
}

function CategorySummary({
  result,
}: {
  result: Exclude<OrganizationResult, { status: "unauthenticated" }>;
}) {
  return (
    <section id="categories" className="mt-11" aria-labelledby="categories-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="categories-title" className="section-title">カテゴリ</h2>
        <Link className="text-button" href="/categories">
          管理する
          <Icon name="chevronRight" size={15} />
        </Link>
      </div>
      {result.status === "error" ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-5 text-sm text-red-700 dark:text-red-300" role="alert">
          カテゴリを読み込めませんでした。ページを再読み込みしてください。
        </div>
      ) : result.categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-raised)] p-5">
          <p className="text-sm text-[var(--muted)]">カテゴリはまだありません。</p>
          <Link className="secondary-button mt-4" href="/categories">
            カテゴリを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {result.categories.map((category) => {
            const color = getCategoryColorPresentation(category.colorKey);

            return (
              <Link
                aria-label={`${category.name} ${category.memoCount}件のメモ`}
                className="category-card"
                href={`/memos?category=${category.id}`}
                key={category.id}
              >
                <span
                  className="flex size-10 items-center justify-center rounded-xl"
                  data-category-color={category.colorKey}
                  style={{ backgroundColor: color.tint, color: color.value }}
                >
                  <Icon name="folder" size={19} />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-[var(--ink)]">{category.name}</span>
                  <span className="mt-0.5 block text-[11px] text-[var(--muted-soft)]">{category.memoCount}件のメモ</span>
                </span>
                <Icon className="ml-auto text-[var(--muted-soft)]" name="chevronRight" size={16} />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MemoDashboard({
  memoResult,
  organizationResult,
}: {
  memoResult: Exclude<MemoListResult, { status: "unauthenticated" }>;
  organizationResult: Exclude<OrganizationResult, { status: "unauthenticated" }>;
}) {
  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10 xl:px-10">
      <PageHeading />
      <Overview />
      <RecentMemos result={memoResult} />
      <CategorySummary result={organizationResult} />
    </div>
  );
}

export default async function Home() {
  const { isAuthenticated } = await getAuthState();

  if (!isAuthenticated) {
    return <PublicHome />;
  }

  const [memoResult, organizationResult] = await Promise.all([
    listMemosForCurrentUser({ limit: RECENT_MEMO_LIMIT }),
    listOrganizationForCurrentUser(),
  ]);

  if (
    memoResult.status === "unauthenticated" ||
    organizationResult.status === "unauthenticated"
  ) {
    redirect("/signin");
  }

  return (
    <MemoDashboard
      memoResult={memoResult}
      organizationResult={organizationResult}
    />
  );
}

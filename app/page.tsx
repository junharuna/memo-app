import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { getAuthState } from "@/lib/supabase/auth";

type Memo = {
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  updatedAt: string;
  icon: IconName;
  accent: string;
  tags: string[];
};

const memos: Memo[] = [
  {
    title: "プロダクトアイデア",
    excerpt: "日々の小さな気づきを、育てられる場所にする。次のリリースで検討したい体験と…",
    category: "アイデア",
    categoryColor: "bg-[#a67cf7]",
    updatedAt: "12分前",
    icon: "sparkles",
    accent: "memo-accent-violet",
    tags: ["企画", "MVP"],
  },
  {
    title: "デザインシステム",
    excerpt: "余白、タイポグラフィ、色彩のルール。静かで一貫性のあるインターフェースを目指す。",
    category: "仕事",
    categoryColor: "bg-[#5e8bff]",
    updatedAt: "昨日",
    icon: "grid",
    accent: "memo-accent-blue",
    tags: ["デザイン", "UI"],
  },
  {
    title: "読みたい本リスト",
    excerpt: "集中力と創造性について。読み終わったら、心に残った一節と考えをここにまとめる。",
    category: "個人",
    categoryColor: "bg-[#ff9f56]",
    updatedAt: "7月28日",
    icon: "book",
    accent: "memo-accent-orange",
    tags: ["読書"],
  },
];

const categories = [
  { name: "仕事", count: 10, color: "#5e8bff", tint: "rgba(94, 139, 255, 0.12)" },
  { name: "個人", count: 8, color: "#ff9f56", tint: "rgba(255, 159, 86, 0.12)" },
  { name: "アイデア", count: 6, color: "#a67cf7", tint: "rgba(166, 124, 247, 0.12)" },
];

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
        <p className="eyebrow">YOUR LIBRARY</p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]">
          すべてのメモ
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
        <button
          aria-label="新しいメモを作成"
          className="primary-button"
          type="button"
        >
          <Icon name="plus" size={18} />
          新しいメモ
        </button>
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

function MemoCard({ memo }: { memo: Memo }) {
  return (
    <article className="memo-card group">
      <button className="absolute inset-0 rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" aria-label={`${memo.title}を開く`} type="button" />
      <div className={`memo-icon ${memo.accent}`} aria-hidden="true">
        <Icon name={memo.icon} size={20} />
      </div>
      <button
        aria-label={`${memo.title}のその他の操作`}
        className="relative z-10 ml-auto flex size-8 items-center justify-center rounded-full text-[var(--muted-soft)] opacity-100 transition hover:bg-[var(--nav-hover)] hover:text-[var(--ink)] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        type="button"
      >
        <Icon name="moreHorizontal" size={18} />
      </button>
      <div className="relative mt-5">
        <h3 className="text-[17px] font-semibold tracking-[-0.025em] text-[var(--ink)]">
          {memo.title}
        </h3>
        <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-[13px] leading-6 text-[var(--muted)]">
          {memo.excerpt}
        </p>
      </div>
      <div className="relative mt-5 flex flex-wrap items-center gap-1.5">
        {memo.tags.map((tag) => (
          <span className="rounded-md bg-[var(--chip)] px-2 py-1 text-[10px] font-medium text-[var(--muted)]" key={tag}>
            #{tag}
          </span>
        ))}
      </div>
      <footer className="relative mt-5 flex items-center border-t border-[var(--hairline-soft)] pt-4 text-[11px] text-[var(--muted-soft)]">
        <span className={`mr-2 size-1.5 rounded-full ${memo.categoryColor}`} aria-hidden="true" />
        <span>{memo.category}</span>
        <span className="mx-2">·</span>
        <time>{memo.updatedAt}</time>
      </footer>
    </article>
  );
}

function RecentMemos() {
  return (
    <section className="mt-11" aria-labelledby="recent-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="recent-title" className="section-title">最近のメモ</h2>
        <button className="text-button" type="button">
          すべて見る
          <Icon name="chevronRight" size={15} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {memos.map((memo) => (
          <MemoCard memo={memo} key={memo.title} />
        ))}
      </div>
    </section>
  );
}

function CategorySummary() {
  return (
    <section id="categories" className="mt-11" aria-labelledby="categories-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="categories-title" className="section-title">カテゴリ</h2>
        <button className="text-button" type="button">
          管理する
          <Icon name="chevronRight" size={15} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {categories.map((category) => (
          <button
            className="category-card"
            id={`category-${category.name}`}
            key={category.name}
            type="button"
          >
            <span
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ background: category.tint, color: category.color }}
            >
              <Icon name="folder" size={19} />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold text-[var(--ink)]">{category.name}</span>
              <span className="mt-0.5 block text-[11px] text-[var(--muted-soft)]">{category.count}件のメモ</span>
            </span>
            <Icon className="ml-auto text-[var(--muted-soft)]" name="chevronRight" size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}

function MemoDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10 xl:px-10">
      <PageHeading />
      <Overview />
      <RecentMemos />
      <CategorySummary />
    </div>
  );
}

export default async function Home() {
  const { isAuthenticated } = await getAuthState();

  return isAuthenticated ? <MemoDashboard /> : <PublicHome />;
}

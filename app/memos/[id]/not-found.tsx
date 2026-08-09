import Link from "next/link";

export default function MemoNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
      <div className="rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-6 text-center shadow-[0_2px_3px_rgba(20,24,31,0.02),0_12px_30px_rgba(20,24,31,0.025)] sm:p-10">
        <p className="eyebrow">NOT FOUND</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
          メモが見つかりません
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          メモが存在しないか、表示する権限がありません。
        </p>
        <Link className="primary-button mt-6" href="/">
          メモ一覧へ戻る
        </Link>
      </div>
    </div>
  );
}

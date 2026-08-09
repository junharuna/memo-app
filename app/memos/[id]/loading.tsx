export default function MemoDetailLoading() {
  return (
    <div
      aria-label="メモを読み込み中"
      className="mx-auto w-full max-w-4xl animate-pulse px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10"
      role="status"
    >
      <div className="h-10 w-32 rounded-xl bg-[var(--chip)]" />
      <div className="mt-6 h-12 w-3/4 rounded-xl bg-[var(--chip)]" />
      <div className="mt-5 h-5 w-52 rounded-lg bg-[var(--chip)]" />
      <div className="mt-10 space-y-3 border-t border-[var(--hairline-soft)] pt-8">
        <div className="h-5 w-full rounded-lg bg-[var(--chip)]" />
        <div className="h-5 w-11/12 rounded-lg bg-[var(--chip)]" />
        <div className="h-5 w-4/5 rounded-lg bg-[var(--chip)]" />
      </div>
    </div>
  );
}

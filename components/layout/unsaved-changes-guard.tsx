"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";

export function UnsavedChangesGuard({ active }: { active: boolean }) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pendingFormRef = useRef<HTMLFormElement | null>(null);
  const bypassRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    function guardLink(event: MouseEvent) {
      if (bypassRef.current || event.defaultPrevented || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (
        anchor.dataset.unsavedGuardIgnore !== undefined ||
        anchor.download ||
        anchor.target === "_blank"
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const href = `${url.pathname}${url.search}${url.hash}`;
      if (href === `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        return;
      }

      event.preventDefault();
      pendingFormRef.current = null;
      setPendingHref(href);
    }

    function guardForm(event: SubmitEvent) {
      if (bypassRef.current || event.defaultPrevented) return;
      const form = event.target;
      if (
        !(form instanceof HTMLFormElement) ||
        form.dataset.unsavedGuardIgnore !== undefined
      ) {
        return;
      }
      event.preventDefault();
      pendingFormRef.current = form;
      setPendingHref("");
    }

    document.addEventListener("click", guardLink, true);
    document.addEventListener("submit", guardForm, true);
    return () => {
      document.removeEventListener("click", guardLink, true);
      document.removeEventListener("submit", guardForm, true);
    };
  }, [active]);

  function continueEditing() {
    pendingFormRef.current = null;
    setPendingHref(null);
  }

  function discardAndContinue() {
    bypassRef.current = true;
    const pendingForm = pendingFormRef.current;
    pendingFormRef.current = null;
    const href = pendingHref;
    setPendingHref(null);

    if (pendingForm) {
      pendingForm.requestSubmit();
    } else if (href) {
      router.push(href);
    }
  }

  if (pendingHref === null) return null;

  return (
    <dialog
      aria-describedby="unsaved-changes-description"
      aria-labelledby="unsaved-changes-title"
      className="fixed inset-0 z-50 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[24px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-0 text-[var(--ink)] shadow-[0_24px_80px_rgba(10,12,18,0.28)] backdrop:bg-black/40"
      open
    >
      <div className="p-5 sm:p-6">
        <span className="flex size-11 items-center justify-center rounded-full bg-amber-500/12 text-amber-700 dark:text-amber-300">
          <Icon name="circleAlert" size={20} />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em]" id="unsaved-changes-title">
          未保存の変更があります
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]" id="unsaved-changes-description">
          移動すると、まだ保存されていない入力内容は失われます。
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            autoFocus
            className="secondary-button w-full sm:w-auto"
            onClick={continueEditing}
            type="button"
          >
            編集を続ける
          </button>
          <button
            className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 sm:w-auto"
            onClick={discardAndContinue}
            type="button"
          >
            変更を破棄して移動
          </button>
        </div>
      </div>
    </dialog>
  );
}

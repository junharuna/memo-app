"use client";

import { useActionState, useState } from "react";
import { saveSettingsAction } from "@/app/settings/actions";
import { Icon } from "@/components/ui/icon";
import {
  type ThemePreference,
  type UserPreferences,
} from "@/lib/settings/preferences";
import { initialSettingsFormState } from "@/lib/settings/settings-state";

const themeOptions: Array<{
  description: string;
  label: string;
  value: ThemePreference;
}> = [
  {
    description: "端末のライト／ダーク設定に合わせます。",
    label: "システム設定",
    value: "system",
  },
  {
    description: "常に明るい配色で表示します。",
    label: "ライト",
    value: "light",
  },
  {
    description: "常に暗い配色で表示します。",
    label: "ダーク",
    value: "dark",
  },
];

function applyThemePreview(theme: ThemePreference) {
  if (theme === "system") {
    delete document.documentElement.dataset.theme;
    return;
  }
  document.documentElement.dataset.theme = theme;
}

export function SettingsForm({ preferences }: { preferences: UserPreferences }) {
  const [state, formAction, isPending] = useActionState(
    saveSettingsAction,
    initialSettingsFormState,
  );
  const [theme, setTheme] = useState(preferences.theme);

  function selectTheme(nextTheme: ThemePreference) {
    setTheme(nextTheme);
    applyThemePreview(nextTheme);
  }

  return (
    <form action={formAction} aria-label="プロフィールと表示設定" className="mt-8 space-y-5" noValidate>
      <section className="rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-5 sm:p-6">
        <h2 className="section-title">プロフィール</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          サイドバーに表示する名前を設定します。
        </p>
        <div className="mt-5 max-w-xl">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="display-name">
            表示名
          </label>
          <input
            aria-describedby={state.fieldErrors.displayName ? "display-name-error" : "display-name-help"}
            aria-invalid={state.fieldErrors.displayName ? "true" : undefined}
            autoComplete="name"
            className="mt-2 h-11 w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
            defaultValue={preferences.displayName}
            id="display-name"
            maxLength={50}
            name="displayName"
            required
          />
          <p className="mt-2 text-xs text-[var(--muted)]" id="display-name-help">
            1〜50文字
          </p>
          {state.fieldErrors.displayName && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300" id="display-name-error">
              {state.fieldErrors.displayName}
            </p>
          )}
        </div>
      </section>

      <fieldset className="rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-5 sm:p-6">
        <legend className="section-title px-1">テーマ</legend>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          画面の明るさを選びます。選択するとすぐにプレビューできます。
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {themeOptions.map((option) => (
            <label
              className="flex cursor-pointer gap-3 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition has-checked:border-blue-500/45 has-checked:ring-4 has-checked:ring-blue-500/10"
              key={option.value}
            >
              <input
                aria-label={option.label}
                checked={theme === option.value}
                className="mt-1 size-4 shrink-0 accent-blue-600"
                name="theme"
                onChange={() => selectTheme(option.value)}
                type="radio"
                value={option.value}
              />
              <span>
                <span className="block text-sm font-semibold text-[var(--ink)]">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        {state.fieldErrors.theme && (
          <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
            {state.fieldErrors.theme}
          </p>
        )}
      </fieldset>

      {state.message && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${state.status === "success" ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300" : "border-red-500/20 bg-red-500/8 text-red-700 dark:text-red-300"}`}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}

      <button
        className="primary-button disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        <Icon name="check" size={17} />
        {isPending ? "保存中…" : "設定を保存"}
      </button>
    </form>
  );
}

import type { ReactNode } from "react";

type AuthPageCardProps = {
  children: ReactNode;
  description: string;
  footer?: ReactNode;
  title: string;
};

export function AuthPageCard({ children, description, footer, title }: AuthPageCardProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1480px] items-center justify-center px-4 py-7 sm:min-h-[calc(100dvh-5rem)] sm:px-6 sm:py-9 lg:px-8 lg:py-10 xl:px-10">
      <section
        aria-labelledby="auth-page-title"
        className="w-full max-w-lg rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-raised)] p-5 shadow-[0_2px_3px_rgba(20,24,31,0.02),0_12px_30px_rgba(20,24,31,0.025)] sm:p-8"
      >
        <p className="eyebrow">WELCOME TO TAGNOTE</p>
        <h1
          className="mt-3 text-[clamp(2rem,8vw,2.75rem)] font-semibold leading-none tracking-[-0.06em] text-[var(--ink)]"
          id="auth-page-title"
        >
          {title}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)] sm:text-[15px]">
          {description}
        </p>

        {children}

        {footer && (
          <div className="mt-6 border-t border-[var(--hairline-soft)] pt-5 text-center text-sm text-[var(--muted)]">
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";

type NavigationLinkProps = {
  activePath?: string;
  href: string;
  icon: IconName;
  label: string;
  variant: "desktop" | "mobile";
};

export function NavigationLink({
  activePath,
  href,
  icon,
  label,
  variant,
}: NavigationLinkProps) {
  const pathname = usePathname();
  const isActive = activePath === pathname;

  if (variant === "mobile") {
    return (
      <Link
        aria-current={isActive ? "page" : undefined}
        className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-medium ${
          isActive
            ? "bg-[var(--surface-raised)] text-blue-600 shadow-sm"
            : "text-[var(--muted)]"
        }`}
        href={href}
      >
        <Icon name={icon} size={18} />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`group flex h-10 items-center gap-3 rounded-[10px] px-3 text-sm transition-colors ${
        isActive
          ? "bg-[var(--nav-active)] font-semibold text-[var(--ink)]"
          : "font-medium text-[var(--muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--ink)]"
      }`}
      href={href}
    >
      <Icon
        className={
          isActive
            ? "text-blue-600"
            : "text-[var(--muted-soft)] group-hover:text-[var(--ink)]"
        }
        name={icon}
        size={18}
      />
      <span>{label}</span>
    </Link>
  );
}

import type { SVGProps } from "react";

export type IconName =
  | "archive"
  | "book"
  | "check"
  | "chevronRight"
  | "circleAlert"
  | "edit"
  | "fileText"
  | "folder"
  | "inbox"
  | "logOut"
  | "menu"
  | "moreHorizontal"
  | "plus"
  | "search"
  | "settings"
  | "sparkles"
  | "star"
  | "tag"
  | "trash"
  | "user"
  | "userPlus"
  | "x";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, React.ReactNode> = {
  archive: (
    <>
      <path d="M4 7h16" />
      <path d="M5 7l1 13h12l1-13" />
      <path d="M3 4h18v3H3z" />
      <path d="M9 11h6" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  circleAlert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </>
  ),
  folder: <path d="M3 5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z" />,
  inbox: (
    <>
      <path d="M4 4h16l2 11v5H2v-5Z" />
      <path d="M2 15h5l2 3h6l2-3h5" />
    </>
  ),
  logOut: (
    <>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  moreHorizontal: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3-1.2 3.3L7.5 7.5l3.3 1.2L12 12l1.2-3.3 3.3-1.2-3.3-1.2Z" />
      <path d="m18.5 13-.8 2.2-2.2.8 2.2.8.8 2.2.8-2.2 2.2-.8-2.2-.8Z" />
      <path d="m5.5 13-.6 1.6-1.6.6 1.6.6.6 1.7.6-1.7 1.7-.6-1.7-.6Z" />
    </>
  ),
  star: <path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.7l6.2-.9Z" />,
  tag: (
    <>
      <path d="M20.6 13.4 11 3.8A2 2 0 0 0 9.6 3H4a1 1 0 0 0-1 1v5.6A2 2 0 0 0 3.8 11l9.6 9.6a2 2 0 0 0 2.8 0l4.4-4.4a2 2 0 0 0 0-2.8Z" />
      <circle cx="7" cy="7" r="1" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 12-4.9" />
      <path d="M19 14v6M16 17h6" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      {...props}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    >
      {paths[name]}
    </svg>
  );
}

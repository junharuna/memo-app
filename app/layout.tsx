import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { listOrganizationForCurrentUser } from "@/lib/memos/organization-queries";
import { getPreferencesForCurrentUser } from "@/lib/settings/preferences";
import { getAuthState } from "@/lib/supabase/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "TagNote",
  title: {
    default: "TagNote — メモを、タグで整える",
    template: "%s | TagNote",
  },
  description: "Markdownメモをカテゴリとタグで整理できる、シンプルなノートアプリ。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated } = await getAuthState();
  const [organization, preferencesResult] = isAuthenticated
    ? await Promise.all([
        listOrganizationForCurrentUser(),
        getPreferencesForCurrentUser(),
      ])
    : [null, null];
  const categories =
    organization?.status === "success" ? organization.categories : [];
  const profile =
    preferencesResult?.status === "success"
      ? preferencesResult.preferences
      : undefined;
  const theme =
    profile?.theme === "dark" || profile?.theme === "light"
      ? profile.theme
      : undefined;

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      data-theme={theme}
    >
      <body className="min-h-full">
        <AppShell
          categories={categories}
          isAuthenticated={isAuthenticated}
          profile={profile}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}

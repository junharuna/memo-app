# TagNote

TagNoteは、Markdownメモをカテゴリとタグで整理するための個人向けノートアプリです。Next.js App Router、TypeScript、Tailwind CSS、Supabaseで構築しています。

## Documentation

- [デザインシステム](./docs/design-system.md)
- [本文検索・カテゴリ・タグの要件と設計](./docs/features/memo-discovery.md)
- [ライフサイクル・自動保存・設定の要件と実装記録](./docs/features/memo-lifecycle-autosave-settings.md)
- [ADR 0001: メモ探索機能](./docs/adr/0001-memo-discovery-data-and-search.md)
- [ADR 0002: メモ状態・競合検出・ユーザー設定](./docs/adr/0002-memo-lifecycle-autosave-and-preferences.md)

## Getting Started

Install dependencies and prepare the local environment:

```bash
npm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in
`.env.local`. Use `lib/supabase/client.ts` from Client Components and
`lib/supabase/server.ts` from server code. The root `proxy.ts` refreshes auth
cookies for SSR requests. Never commit `.env.local`.

For passwordless email authentication, set the Supabase Auth Site URL to the
application origin (for example, `http://localhost:3000` locally). The Japanese
templates in `supabase/templates/` send their token hash to `/auth/confirm`,
which verifies it and creates a cookie-backed session.

To publish the TagNote email subjects and templates to a hosted Supabase
project, create a personal access token in the Supabase dashboard and run:

```bash
SUPABASE_PROJECT_REF=your-project-ref \
SUPABASE_ACCESS_TOKEN=your-personal-access-token \
npm run supabase:email-templates
```

Keep the personal access token outside `.env.local` and never commit it.

Check the configured Supabase connection with `GET /api/health/supabase`. It
returns `{"status":"ok"}` with HTTP 200 when Supabase is reachable, or a
generic `{"status":"error"}` with HTTP 503 without exposing credentials.

## Development checks

Before opening a pull request, run the checks defined in `package.json`:

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
```

These commands run ESLint, TypeScript type checking, and the Jest test suite, respectively. Run `npm run build` when a production build needs to be verified. A successful local check is not a substitute for reviewing the actual diff.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

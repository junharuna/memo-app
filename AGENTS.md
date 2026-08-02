# Repository Guidelines

## Project Structure & Module Organization

This Next.js 16 App Router app uses TypeScript, Tailwind CSS 4, and Supabase. Keep routes in `app/`, assets in `public/`, and tests in `__tests__/` or beside source. Supabase utilities are in `lib/supabase/`: `client.ts` serves Client Components, `server.ts` server code, `env.ts` configuration, and `proxy.ts` auth-cookie refresh. The root `proxy.ts` invokes it. Use `@/*` imports.

## Build, Test, and Development Commands

- `npm run dev` starts development at `http://localhost:3000`.
- `npm run lint` runs ESLint and Next.js rules.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm test` runs Jest once; `npm run test:watch` watches changes.
- `npm run build` creates and validates the production build.
- `npm run start` serves a completed production build.

## Coding Style & Naming Conventions

Use strict TypeScript with two-space indentation, double quotes, semicolons, and trailing commas. Name components and types in PascalCase, functions and variables in camelCase, and route segments in lowercase. Colocate route code, extract UI, and prefer Tailwind utilities. Fix type and lint errors; never suppress them.

## Testing Guidelines

Use Jest and React Testing Library. Follow TDD: write a failing test first, add the minimum implementation, then refactor while tests stay green. Name tests `*.test.ts` or `*.test.tsx` and assert observable behavior and errors. Mock Supabase in unit tests; do not depend on the remote project. After every change, `npm run typecheck` and `npm run lint` must pass. Run `npm test` for behavior changes; also run `npm run build` and check the browser for application changes.

## Supabase, Database & Security

Keep `.env.local` untracked; document variables in `.env.example`. Only the URL and Publishable Key may use `NEXT_PUBLIC_`; never expose Secret or Service Role keys. Enable RLS on every public table and scope user rows with `auth.uid()` policies. Inspect tables before schema changes, apply versioned migrations, then regenerate TypeScript database types. Use `getClaims()` for server authorization—never trust `getSession()`. Keep refresh in `proxy.ts`, preserve its cookies and cache headers, and handle failures explicitly.

## Commit & Pull Request Guidelines

Use atomic Conventional Commits with Japanese descriptions, such as `feat: メモ作成画面を追加`. Pull requests must explain purpose and validation, link issues, include screenshots for visual changes, and call out dependency, configuration, or migration impacts.

## Agent Notes

Use Japanese for user-facing chat. Before framework changes, read the relevant guide under `node_modules/next/dist/docs/`. Before Supabase changes, consult current official documentation and inspect the connected project through MCP.

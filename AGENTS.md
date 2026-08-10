# Repository Guidelines

## Project Structure & Module Organization

This Next.js 16 App Router app uses TypeScript, Tailwind CSS 4, and Supabase. Keep routes in `app/`, reusable components in `components/`, product and engineering documentation in `docs/`, assets in `public/`, and tests in `__tests__/` or beside source. Supabase utilities are in `lib/supabase/`: `client.ts` serves Client Components, `server.ts` server code, `env.ts` configuration, and `proxy.ts` auth-cookie refresh. The root `proxy.ts` invokes it. Use `@/*` imports.

## Build, Test, and Development Commands

- `npm run dev` starts development at `http://localhost:3000`.
- `npm run lint` runs ESLint and Next.js rules.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm test` runs Jest once; `npm run test:watch` watches changes.
- `npm run build` creates and validates the production build.
- `npm run start` serves a completed production build.

## Coding Style & Naming Conventions

Use strict TypeScript with two-space indentation, double quotes, semicolons, and trailing commas. Name components and types in PascalCase, functions and variables in camelCase, and route segments in lowercase. Colocate route code, extract UI, and prefer Tailwind utilities. Fix type and lint errors; never suppress them.

## Design System Compliance

Before every task that adds or changes a page, layout, UI component, visual state, responsive behavior, animation, or user-facing copy, read `docs/design-system.md` completely before editing. Treat it as a required implementation constraint, not optional visual guidance. Reuse the application shell, semantic color tokens, spacing, typography, radii, elevation, controls, cards, icon system, responsive patterns, and accessibility rules defined there. Do not introduce arbitrary colors or near-duplicate components when an existing pattern fits.

If a product requirement cannot be met within the current system, make the smallest coherent extension and update `docs/design-system.md` and the implementation source of truth in the same change. Document intentional exceptions in the pull request. For visual changes, verify at least 390px and 1440px viewport widths, light and dark appearances, visible keyboard focus, and reduced-motion behavior where animation is involved.

## Testing Guidelines

Use Jest and React Testing Library. Follow TDD: write a failing test first, add the minimum implementation, then refactor while tests stay green. Name tests `*.test.ts` or `*.test.tsx` and assert observable behavior and errors. Mock Supabase in unit tests; do not depend on the remote project. After every change, `npm run typecheck` and `npm run lint` must pass. Run `npm test` for behavior changes; also run `npm run build` and check the browser for application changes.

## Supabase, Database & Security

Keep `.env.local` untracked; document variables in `.env.example`. Only the URL and Publishable Key may use `NEXT_PUBLIC_`; never expose Secret or Service Role keys. Enable RLS on every public table and scope user rows with `auth.uid()` policies. Inspect tables before schema changes, apply versioned migrations, then regenerate TypeScript database types. Use `getClaims()` for server authorization—never trust `getSession()`. Keep refresh in `proxy.ts`, preserve its cookies and cache headers, and handle failures explicitly.

## Product Direction & Current Status

TagNote is a personal memo application for capturing Markdown notes and organizing them with categories and tags. The public home page and passwordless authentication flow are implemented; unauthenticated users receive the public shell and cannot access memo controls. Memo creation, listing, detail display, conflict-safe editing and autosave, lifecycle management, body search, category classification, tag filtering, sorting, and profile/theme settings are backed by Supabase for authenticated users. Preserve the shared application shell in `components/layout/app-shell.tsx` as routes are added.

### Implemented Memo Scope

- Creation: `/memos/new` provides an authenticated title and Markdown editor, live CommonMark/GFM preview, category and multi-tag selection, server-side validation, explicit success and failure feedback, and atomic insertion into Supabase with the authenticated user as owner.
- Listing: `/` loads the current user's three most recently updated memos from Supabase, and `/memos` provides the complete library in pages of 24 ordered by `updated_at desc, id desc`. A “show all” link connects the two views. Cards link to their detail routes, keep a uniform height, show category and at most two tags, and use a plain-text excerpt without rendering Markdown. Initial-empty, filtered-empty, and query-error states are distinct.
- Detail display: `/memos/[id]` validates the memo ID, loads only a memo owned by the current user, and renders its Markdown with the shared safe renderer. Missing or inaccessible memos return not found, and query failures show a retry path.
- Editing and autosave: `/memos/[id]/edit` loads the current user's saved title, Markdown source, category, and tags into the shared editor and preview. A one-second debounce saves content atomically with a monotonic revision, reports unsaved/saving/saved/error/conflict states, and warns before unsafe browser or in-app navigation. Manual save remains available, and owner-scoped UPDATE RLS plus column-level grants prevent changes to other users' memos or ownership fields.
- Lifecycle: active memos can be favorited, archived, moved to trash, and restored through owner-scoped actions. `/memos?view=favorites|archive|trash` provides state-specific views; active/favorite lists support validated user sorting. Trash detail is read-only, and permanent deletion requires both an explicit confirmation and the database-enforced trashed state.
- Organization: `/categories` and `/tags` provide owner-scoped CRUD, related memo counts, explicit deletion consequences, and keyboard-accessible confirmation dialogs. Category creation and editing use ten predefined, visibly swatched classification colors that remain consistent across the shell and memo views. Memo creation and editing assign zero or one category and multiple tags atomically; deleting a category or tag preserves its memos.
- Discovery: `/memos` searches the current user's Markdown source body by case-insensitive partial match and combines up to eight terms, one category or the uncategorized state, and multiple tags with AND semantics. The canonical URL preserves filters and 24-item pagination; the header, sidebar, detail links, result counts, active-condition controls, and distinct filtered-empty state use the same contract.
- Markdown safety: Markdown source remains canonical, CommonMark/GFM and soft line breaks are supported, raw HTML is skipped, and external links use safe `rel` attributes.
- Account preferences: `/settings` persists the authenticated user's display name and `system / light / dark` theme in the owner-scoped `profiles` table. The server-rendered root applies explicit themes before first paint, and the application shell uses real profile/email data rather than samples.
- Database security: the `memos`, `categories`, `tags`, `memo_tags`, and `profiles` tables, ownership constraints, validation constraints, indexes, automatic `updated_at` maintenance, column-limited grants, security-invoker RPCs, and owner-scoped RLS policies are managed through versioned Supabase migrations.
- Not yet implemented: bulk lifecycle actions, trash retention/automatic cleanup, navigation counts, keyboard search shortcut, full version history, collaborative editing, and the optional search/tag selection enhancements listed as Should requirements in `docs/features/memo-discovery.md`.

The product should remain focused, responsive, and accessible. Follow Apple-inspired interaction principles: clear hierarchy, restrained decoration, generous spacing, immediate feedback, keyboard support, reduced-motion support, and first-class light and dark appearances. Do not copy Apple assets or interfaces verbatim.

## Planned Product Capabilities

Detailed requirements, architecture, delivery phases, and acceptance criteria for memo body search, category classification, and tag filtering are defined in `docs/features/memo-discovery.md`. The related search and data-model decisions are recorded in `docs/adr/0001-memo-discovery-data-and-search.md`.

The implemented requirements and delivery record for favorites, archive/trash, conflict-safe autosave, real profile data, and persisted theme selection are defined in `docs/features/memo-lifecycle-autosave-settings.md`. The underlying state, optimistic-concurrency, deletion-safety, and preference decisions are recorded in accepted `docs/adr/0002-memo-lifecycle-autosave-and-preferences.md`.

- Authentication: add sign-up, sign-in, sign-out, protected routes, and account recovery with Supabase Auth. Keep anonymous and authenticated states explicit, and redirect safely without accepting unvalidated return URLs.
- Memo lifecycle: creation, read, conflict-safe editing/autosave, favorite, archive, trash, restore, and trash-only permanent deletion are complete. Future lifecycle work should focus on optional bulk operations and retention policy without weakening destructive-action confirmation or owner isolation.
- Markdown authoring: the shared creation/edit editor, live preview, rendered detail view, autosave status, and unsaved-navigation protection are complete. Continue preserving the Markdown source as canonical, sanitizing rendered output, and disallowing unsafe HTML by default.
- Organization: user-owned category assignment, many-to-many tagging, filtering, and deletion that preserves memos are complete. Continue measuring and hardening these workflows as data volume grows.
- Discovery: owner-scoped Markdown body keyword search, combined category/tag filtering, validated sorting, favorites, archive, and trash views are complete. Every future query must preserve owner isolation.
- Responsive UX: keep the desktop sidebar and mobile navigation useful as real routes replace placeholders. Include loading, empty, error, offline/network-failure, and success states for every data-backed workflow.
- Account experience: authenticated profile display and persisted theme/display-name settings are complete. Account recovery, email changes, and account deletion remain future work.

## Delivery Plan

1. Foundation: maintain the implemented responsive application shell, design tokens, metadata, accessibility baseline, and representative UI tests.
2. Authentication and schema: the authenticated memo, organization, lifecycle, optimistic-revision, and profile schemas, ownership constraints, indexes, column grants, security-invoker functions, and RLS policies are complete.
3. Core memo flow: authenticated creation, listing, read/detail, conflict-safe editing/autosave, lifecycle transitions, restore, and trash-only permanent deletion are complete with server authorization, confirmation, and explicit failure handling.
4. Markdown: creation/edit authoring, live preview, safe detail rendering, autosave status, conflict handling, and unsaved-navigation protection are complete with formatting and unsafe-HTML regression coverage.
5. Organization and discovery: categories, tags, body search, combined filtering, state views, favorites, and sorting are connected to persisted user data.
6. Product hardening: add recovery and empty states, responsive browser coverage, accessibility checks, performance measurement, observability, and end-to-end tests for critical journeys.

Complete each stage in small, independently testable changes. Do not introduce later-stage abstractions until the current workflow needs them, but keep data ownership and Markdown safety non-negotiable from the first implementation.

## Commit & Pull Request Guidelines

Use atomic Conventional Commits with Japanese descriptions, such as `feat: メモ作成画面を追加`. Pull requests must explain purpose and validation, link issues, include screenshots for visual changes, and call out dependency, configuration, or migration impacts.

## Agent Notes

Use Japanese for user-facing chat. Before any UI-affecting change, follow the mandatory design-system reading and validation rules above. Before framework changes, read the relevant guide under `node_modules/next/dist/docs/`. Before Supabase changes, consult current official documentation and inspect the connected project through MCP.

### Authenticated Browser Verification with Playwright MCP

Use the persistent Playwright MCP browser session for checks that require a signed-in user. First navigate to the real protected route under test. If it remains on that route, reuse the existing authenticated session. If it redirects to `/signin`, navigate to the sign-in page and stop; ask the user to complete the magic-link flow in the Playwright browser. Do not attempt to read the user's email, retrieve the magic link, or continue past the sign-in page until the user explicitly confirms that authentication is complete.

After confirmation, revisit the protected route and verify that it no longer redirects before continuing the requested checks. Preserve the session for later verification: do not sign out, clear cookies or browser storage, close the browser, or reset its context unless the user explicitly requests it. Use real application routes and authorization boundaries; do not add temporary authentication bypasses or public preview routes for browser verification. Do not create or mutate application data unless the requested verification requires it and the user has authorized that scope.

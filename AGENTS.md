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

TagNote is intended to become a personal memo application for capturing Markdown notes and organizing them with categories and tags. The public home page and passwordless authentication flow are implemented; unauthenticated users receive the public shell and cannot access memo controls. Memo creation, listing, and detail display are backed by Supabase for authenticated users. The remaining navigation, search, profile, category, tag, favorite, archive, and trash data and controls are still presentation-only samples or placeholders unless their behavior is covered by tests and backed by application data. Preserve the shared application shell in `components/layout/app-shell.tsx` as routes are added.

### Implemented Memo Scope

- Creation: `/memos/new` provides an authenticated title and Markdown editor, live CommonMark/GFM preview, server-side validation, explicit success and failure feedback, and insertion into Supabase with the authenticated user as owner.
- Listing: `/` loads only the current user's memos from Supabase in descending `updated_at` order. Cards link to their detail routes, keep a uniform height, and show a plain-text excerpt without rendering Markdown. Empty and query-error states are implemented.
- Detail display: `/memos/[id]` validates the memo ID, loads only a memo owned by the current user, and renders its Markdown with the shared safe renderer. Missing or inaccessible memos return not found, and query failures show a retry path.
- Markdown safety: Markdown source remains canonical, CommonMark/GFM and soft line breaks are supported, raw HTML is skipped, and external links use safe `rel` attributes.
- Database security: the `memos` table, ownership constraints, validation constraints, indexes, and owner-scoped RLS policies for INSERT and SELECT are managed through versioned Supabase migrations.
- Not yet implemented: memo editing, autosave, deletion, favorites, archive/trash workflows, categories, tags, search, filtering, and user-selectable sorting.

The product should remain focused, responsive, and accessible. Follow Apple-inspired interaction principles: clear hierarchy, restrained decoration, generous spacing, immediate feedback, keyboard support, reduced-motion support, and first-class light and dark appearances. Do not copy Apple assets or interfaces verbatim.

## Planned Product Capabilities

- Authentication: add sign-up, sign-in, sign-out, protected routes, and account recovery with Supabase Auth. Keep anonymous and authenticated states explicit, and redirect safely without accepting unvalidated return URLs.
- Memo lifecycle: creation and read flows are complete. Next, let each user edit, autosave, favorite, archive, move to trash, restore, and permanently delete only their own memos. Destructive actions require clear confirmation and error feedback.
- Markdown authoring: the creation editor, live preview, and rendered detail view are complete. Continue preserving the Markdown source as canonical, sanitizing rendered output, disallowing unsafe HTML by default, and covering XSS-sensitive inputs as editing and autosave are added.
- Organization: support user-owned categories and tags, including category assignment, many-to-many tagging, and filtering. Deleting a category or tag must not silently delete its memos.
- Discovery: implement scoped full-text search, sorting, recent notes, favorites, archives, and trash views. Search and filters must never expose another user's data.
- Responsive UX: keep the desktop sidebar and mobile navigation useful as real routes replace placeholders. Include loading, empty, error, offline/network-failure, and success states for every data-backed workflow.
- Account experience: replace sample profile data with authenticated user data and provide settings needed for profile and account management.

## Delivery Plan

1. Foundation: maintain the implemented responsive application shell, design tokens, metadata, accessibility baseline, and representative UI tests.
2. Authentication and schema: the authenticated memo schema, ownership constraints, indexes, and INSERT/SELECT RLS policies are complete. Profiles, categories, tags, memo-tag relationships, and the policies required by future memo mutations remain pending.
3. Core memo flow: authenticated creation, listing, and read/detail flows are complete with server authorization and explicit failure handling. Editing and deletion remain pending.
4. Markdown: creation-time editing and preview plus safe detail rendering are complete with formatting and unsafe-HTML regression coverage. Edit-flow integration and autosave status remain pending.
5. Organization and discovery: connect categories, tags, favorites, archive, trash, search, filtering, and sorting to persisted user data.
6. Product hardening: add recovery and empty states, responsive browser coverage, accessibility checks, performance measurement, observability, and end-to-end tests for critical journeys.

Complete each stage in small, independently testable changes. Do not introduce later-stage abstractions until the current workflow needs them, but keep data ownership and Markdown safety non-negotiable from the first implementation.

## Commit & Pull Request Guidelines

Use atomic Conventional Commits with Japanese descriptions, such as `feat: メモ作成画面を追加`. Pull requests must explain purpose and validation, link issues, include screenshots for visual changes, and call out dependency, configuration, or migration impacts.

## Agent Notes

Use Japanese for user-facing chat. Before any UI-affecting change, follow the mandatory design-system reading and validation rules above. Before framework changes, read the relevant guide under `node_modules/next/dist/docs/`. Before Supabase changes, consult current official documentation and inspect the connected project through MCP.

### Authenticated Browser Verification with Playwright MCP

Use the persistent Playwright MCP browser session for checks that require a signed-in user. First navigate to the real protected route under test. If it remains on that route, reuse the existing authenticated session. If it redirects to `/signin`, navigate to the sign-in page and stop; ask the user to complete the magic-link flow in the Playwright browser. Do not attempt to read the user's email, retrieve the magic link, or continue past the sign-in page until the user explicitly confirms that authentication is complete.

After confirmation, revisit the protected route and verify that it no longer redirects before continuing the requested checks. Preserve the session for later verification: do not sign out, clear cookies or browser storage, close the browser, or reset its context unless the user explicitly requests it. Use real application routes and authorization boundaries; do not add temporary authentication bypasses or public preview routes for browser verification. Do not create or mutate application data unless the requested verification requires it and the user has authorized that scope.

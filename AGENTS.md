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

TagNote is intended to become a personal memo application for capturing Markdown notes and organizing them with categories and tags. The current home page, navigation, search, memo cards, profile, and category data are presentation-only samples. Buttons and filters are placeholders unless their behavior is covered by tests and backed by application data. Preserve the shared application shell in `components/layout/app-shell.tsx` as routes are added.

The product should remain focused, responsive, and accessible. Follow Apple-inspired interaction principles: clear hierarchy, restrained decoration, generous spacing, immediate feedback, keyboard support, reduced-motion support, and first-class light and dark appearances. Do not copy Apple assets or interfaces verbatim.

## Planned Product Capabilities

- Authentication: add sign-up, sign-in, sign-out, protected routes, and account recovery with Supabase Auth. Keep anonymous and authenticated states explicit, and redirect safely without accepting unvalidated return URLs.
- Memo lifecycle: let each user create, read, edit, autosave, favorite, archive, move to trash, restore, and permanently delete only their own memos. Destructive actions require clear confirmation and error feedback.
- Markdown authoring: provide a focused editor with preview and rendered views. Preserve the Markdown source as the canonical content, sanitize rendered output, disallow unsafe HTML by default, and test XSS-sensitive inputs.
- Organization: support user-owned categories and tags, including category assignment, many-to-many tagging, and filtering. Deleting a category or tag must not silently delete its memos.
- Discovery: implement scoped full-text search, sorting, recent notes, favorites, archives, and trash views. Search and filters must never expose another user's data.
- Responsive UX: keep the desktop sidebar and mobile navigation useful as real routes replace placeholders. Include loading, empty, error, offline/network-failure, and success states for every data-backed workflow.
- Account experience: replace sample profile data with authenticated user data and provide settings needed for profile and account management.

## Delivery Plan

1. Foundation: maintain the implemented responsive application shell, design tokens, metadata, accessibility baseline, and representative UI tests.
2. Authentication and schema: define versioned Supabase migrations for profiles, memos, categories, tags, and memo-tag relationships; add indexes, timestamps, ownership constraints, and RLS policies before connecting UI.
3. Core memo flow: implement authenticated memo listing and create/edit/read/delete flows using server authorization and explicit failure handling.
4. Markdown: add editing, preview, safe rendering, autosave status, and regression tests for formatting and unsafe content.
5. Organization and discovery: connect categories, tags, favorites, archive, trash, search, filtering, and sorting to persisted user data.
6. Product hardening: add recovery and empty states, responsive browser coverage, accessibility checks, performance measurement, observability, and end-to-end tests for critical journeys.

Complete each stage in small, independently testable changes. Do not introduce later-stage abstractions until the current workflow needs them, but keep data ownership and Markdown safety non-negotiable from the first implementation.

## Commit & Pull Request Guidelines

Use atomic Conventional Commits with Japanese descriptions, such as `feat: メモ作成画面を追加`. Pull requests must explain purpose and validation, link issues, include screenshots for visual changes, and call out dependency, configuration, or migration impacts.

## Agent Notes

Use Japanese for user-facing chat. Before any UI-affecting change, follow the mandatory design-system reading and validation rules above. Before framework changes, read the relevant guide under `node_modules/next/dist/docs/`. Before Supabase changes, consult current official documentation and inspect the connected project through MCP.

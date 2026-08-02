# Repository Guidelines

## Project Structure & Module Organization

This Next.js 16 App Router app uses React 19, TypeScript, and Tailwind CSS 4. Application code lives in `app/`: `page.tsx` defines routes, `layout.tsx` shared layouts, and `globals.css` global styles. Put static files in `public/`. Root configuration includes `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`. Use `@/*` for root imports.

## Build, Test, and Development Commands

- `npm run dev` starts the local development server at `http://localhost:3000` with hot reload.
- `npm run lint` runs ESLint with Next.js Core Web Vitals and TypeScript rules.
- `npm run typecheck` checks TypeScript without emitting compiled files.
- `npm test` runs the Jest test suite once.
- `npm run test:watch` reruns relevant tests as files change.
- `npm run build` creates a production build and catches compilation and type errors.
- `npm run start` serves the production build; run `npm run build` first.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, double quotes, semicolons, and trailing commas. Name components and types in PascalCase, functions and variables in camelCase, and route segments in lowercase. Keep route-specific code nearby and extract shared UI into named modules. Prefer Tailwind utilities; reserve `app/globals.css` for shared rules. Fix type and lint errors instead of suppressing them.

## Testing Guidelines

Use Jest and React Testing Library for component tests. Follow TDD for implementation: first write a failing test, add the minimum code to pass, then refactor while tests stay green. Put `*.test.ts` or `*.test.tsx` files in `__tests__/` or beside source. `jest.setup.ts` provides `jest-dom`; assert user-visible behavior and errors with Testing Library. Use `npm run test:watch` during development and `npm test` for final verification. After every change, `npm run typecheck` and `npm run lint` must pass.

## Commit & Pull Request Guidelines

The history currently contains only the Create Next App initial commit. Use Conventional Commit prefixes for new work, for example `feat: メモ作成画面を追加` or `fix: 空入力を拒否する`. Keep commits atomic. Pull requests should explain the purpose, summarize validation performed, link related issues, and include screenshots for visual changes. Call out configuration, dependency, or migration impacts explicitly.

## Security & Agent Notes

Keep secrets in untracked environment files such as `.env.local`; never commit credentials. Validate user-controlled input and handle external failures explicitly. Use Japanese for all user-facing chat. This Next.js version may differ from familiar APIs: before changing framework code, read the relevant documentation under `node_modules/next/dist/docs/` and follow deprecation notices.

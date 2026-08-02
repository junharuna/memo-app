# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js 16 application using the App Router, React 19, TypeScript, and Tailwind CSS 4. Route UI and layouts live in `app/`; `app/page.tsx` defines the home page, `app/layout.tsx` defines shared metadata and layout, and `app/globals.css` contains global styles and Tailwind setup. Static files belong in `public/`. Root-level configuration includes `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`. Use the `@/*` TypeScript alias for imports from the repository root.

## Build, Test, and Development Commands

- `npm install` installs the exact dependency versions recorded in `package-lock.json`.
- `npm run dev` starts the local development server at `http://localhost:3000` with hot reload.
- `npm run lint` runs ESLint with Next.js Core Web Vitals and TypeScript rules.
- `npm run build` creates a production build and catches compilation and type errors.
- `npm run start` serves the production build; run `npm run build` first.

## Coding Style & Naming Conventions

Write strict TypeScript and prefer small, focused React components. Follow the existing style: two-space indentation, double quotes, semicolons, and trailing commas. Use PascalCase for components and types, camelCase for functions and variables, and lowercase route-segment names. Keep route-specific code near its route; extract reusable UI into clearly named modules. Use Tailwind utility classes for component styling and reserve `app/globals.css` for shared rules. Do not suppress type or lint errors; fix their cause.

## Testing Guidelines

No automated test framework or coverage threshold is configured yet. Until one is added, every change must pass `npm run lint` and `npm run build`, followed by a focused browser check. When introducing tests, colocate them as `*.test.ts` or `*.test.tsx`, test observable behavior and error cases, and add the runner command to `package.json` and this guide.

## Commit & Pull Request Guidelines

The history currently contains only the Create Next App initial commit. Use Conventional Commit prefixes for new work, for example `feat: メモ作成画面を追加` or `fix: 空入力を拒否する`. Keep commits atomic. Pull requests should explain the purpose, summarize validation performed, link related issues, and include screenshots for visual changes. Call out configuration, dependency, or migration impacts explicitly.

## Security & Agent Notes

Keep secrets in untracked environment files such as `.env.local`; never commit credentials. Validate user-controlled input and handle external failures explicitly. Use Japanese for all user-facing chat. This Next.js version may differ from familiar APIs: before changing framework code, read the relevant documentation under `node_modules/next/dist/docs/` and follow deprecation notices.

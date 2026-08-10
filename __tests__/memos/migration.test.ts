/** @jest-environment node */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260809133220_create_memos.sql",
);
const readPolicyMigrationPath = join(
  process.cwd(),
  "supabase/migrations/20260809143727_enable_memo_reads.sql",
);
const updatePolicyMigrationPath = join(
  process.cwd(),
  "supabase/migrations/20260810120000_enable_memo_updates.sql",
);
const deletePolicyMigrationPath = join(
  process.cwd(),
  "supabase/migrations/20260810150000_enable_memo_deletes.sql",
);
const organizationMigrationPath = join(
  process.cwd(),
  "supabase/migrations/20260810190000_create_memo_organization.sql",
);
const searchMigrationPath = join(
  process.cwd(),
  "supabase/migrations/20260810200000_add_memo_discovery_functions.sql",
);
const categoryInsertGrantMigrationPath = join(
  process.cwd(),
  "supabase/migrations/20260810203000_grant_memo_category_insert.sql",
);
const categoryColorsMigrationPath = join(
  process.cwd(),
  "supabase/migrations/20260810210000_expand_category_colors.sql",
);
const lifecycleMigrationPath = join(
  process.cwd(),
  "supabase/migrations/20260810220000_add_memo_lifecycle_and_profiles.sql",
);
const profileFunctionMigrationPath = join(
  process.cwd(),
  "supabase/migrations/20260810230000_add_profile_preferences_function.sql",
);

it("メモテーブルを所有権付きで作成しINSERTだけを許可する", () => {
  const sql = readFileSync(migrationPath, "utf8");

  expect(sql).toMatch(/create table public\.memos/i);
  expect(sql).toMatch(/owner_id uuid[^;]+references auth\.users/i);
  expect(sql).toMatch(/enable row level security/i);
  expect(sql).toMatch(/for insert[\s\S]+with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
  expect(sql).toMatch(/grant insert \(owner_id, title, content\) on table public\.memos to authenticated/i);
  expect(sql).not.toMatch(/grant (select|update|delete)/i);
});

it("認証済みユーザーが自分のメモだけを更新日時順で取得できるようにする", () => {
  const sql = readFileSync(readPolicyMigrationPath, "utf8");

  expect(sql).toMatch(/grant select on table public\.memos to authenticated/i);
  expect(sql).toMatch(
    /for select[\s\S]+using \(\(select auth\.uid\(\)\) = owner_id\)/i,
  );
  expect(sql).toMatch(/on public\.memos \(owner_id, updated_at desc\)/i);
  expect(sql).not.toMatch(/\bto anon\b/i);
});

it("認証済みユーザーが自分のメモのタイトルと本文だけを更新できるようにする", () => {
  const sql = readFileSync(updatePolicyMigrationPath, "utf8");

  expect(sql).toMatch(
    /grant update \(title, content\) on table public\.memos to authenticated/i,
  );
  expect(sql).toMatch(
    /for update[\s\S]+using \(\(select auth\.uid\(\)\) = owner_id\)[\s\S]+with check \(\(select auth\.uid\(\)\) = owner_id\)/i,
  );
  expect(sql).toMatch(/before update of title, content on public\.memos/i);
  expect(sql).toMatch(/new\.updated_at = now\(\)/i);
  expect(sql).not.toMatch(/grant update[^;]+owner_id/i);
  expect(sql).not.toMatch(/\bto anon\b/i);
});

it("認証済みユーザーが自分のメモだけを削除できるようにする", () => {
  const sql = readFileSync(deletePolicyMigrationPath, "utf8");

  expect(sql).toMatch(/grant delete on table public\.memos to authenticated/i);
  expect(sql).toMatch(
    /for delete[\s\S]+to authenticated[\s\S]+using \(\(select auth\.uid\(\)\) = owner_id\)/i,
  );
  expect(sql).not.toMatch(/\bto anon\b/i);
});

it("カテゴリとタグを所有権と削除時のメモ保持を保証して作成する", () => {
  const sql = readFileSync(organizationMigrationPath, "utf8");

  expect(sql).toMatch(/create table public\.categories/i);
  expect(sql).toMatch(/create table public\.tags/i);
  expect(sql).toMatch(/create table public\.memo_tags/i);
  expect(sql).toMatch(/add column category_id uuid/i);
  expect(sql).toMatch(/foreign key \(owner_id, category_id\)[\s\S]+on delete set null \(category_id\)/i);
  expect(sql).toMatch(/foreign key \(owner_id, memo_id\)[\s\S]+on delete cascade/i);
  expect(sql).toMatch(/foreign key \(owner_id, tag_id\)[\s\S]+on delete cascade/i);
  expect(sql.match(/enable row level security/gi)).toHaveLength(3);
  expect(sql).toMatch(/grant update \(category_id\) on table public\.memos to authenticated/i);
  expect(sql).not.toMatch(/\bto anon\b/i);
});

it("所有者限定の本文検索と原子的なメモ保存関数を追加する", () => {
  const sql = readFileSync(searchMigrationPath, "utf8");

  expect(sql).toMatch(/create extension if not exists pg_trgm with schema extensions/i);
  expect(sql).toMatch(/using gin \(content extensions\.gin_trgm_ops\)/i);
  expect(sql).toMatch(/create function public\.search_memos/i);
  expect(sql).toMatch(/m\.owner_id = \(select auth\.uid\(\)\)/i);
  expect(sql).toMatch(/security invoker/i);
  expect(sql).toMatch(/create function public\.create_memo_with_metadata/i);
  expect(sql).toMatch(/create function public\.update_memo_with_metadata/i);
  expect(sql).toMatch(/set search_path = ''/i);
  expect(sql).toMatch(/grant execute on function public\.search_memos/i);
  expect(sql).not.toMatch(/security definer/i);
  expect(sql).not.toMatch(/\bto anon\b/i);
});

it("メモ作成関数へカテゴリ列だけのINSERT権限を追加する", () => {
  const sql = readFileSync(categoryInsertGrantMigrationPath, "utf8");

  expect(sql).toMatch(
    /grant insert \(category_id\) on table public\.memos to authenticated/i,
  );
  expect(sql).not.toMatch(/grant insert[^;]+\bid\b/i);
  expect(sql).not.toMatch(/grant insert[^;]+\bupdated_at\b/i);
  expect(sql).not.toMatch(/\bto anon\b/i);
});

it("既存カテゴリを保持したまま分類色のCHECK制約を10色へ拡張する", () => {
  const sql = readFileSync(categoryColorsMigrationPath, "utf8");

  expect(sql).toMatch(/drop constraint categories_color_key_valid/i);
  expect(sql).toMatch(/add constraint categories_color_key_valid/i);
  for (const color of [
    "blue",
    "sky",
    "cyan",
    "teal",
    "lime",
    "yellow",
    "orange",
    "rose",
    "pink",
    "violet",
  ]) {
    expect(sql).toContain(`'${color}'`);
  }
  expect(sql).not.toMatch(/\b(update|delete from)\s+public\.categories\b/i);
  expect(sql).not.toMatch(/\bto anon\b/i);
});

it("メモの復元可能な状態、競合検出、所有者限定設定を追加する", () => {
  const sql = readFileSync(lifecycleMigrationPath, "utf8");

  expect(sql).toMatch(/add column favorited_at timestamptz/i);
  expect(sql).toMatch(/add column archived_at timestamptz/i);
  expect(sql).toMatch(/add column trashed_at timestamptz/i);
  expect(sql).toMatch(/add column revision bigint not null default 1/i);
  expect(sql).toMatch(/create table public\.profiles/i);
  expect(sql).toMatch(/theme in \('system', 'light', 'dark'\)/i);
  expect(sql).toMatch(/alter table public\.profiles enable row level security/i);
  expect(sql).toMatch(/auth\.uid\(\)\) = owner_id/i);
  expect(sql).toMatch(/for delete[\s\S]+trashed_at is not null/i);
  expect(sql).toMatch(/create function public\.search_memos_v2/i);
  expect(sql).toMatch(/create function public\.save_memo_revision/i);
  expect(sql).toMatch(/expected_revision/i);
  expect(sql).toMatch(/security invoker/i);
  expect(sql).not.toMatch(/security definer/i);
  expect(sql).not.toMatch(/\bto anon\b/i);
});

it("所有者IDをクライアント入力にせずプロフィールを原子的に保存する", () => {
  const sql = readFileSync(profileFunctionMigrationPath, "utf8");

  expect(sql).toMatch(/create function public\.save_profile_preferences/i);
  expect(sql).toMatch(/values \(\(select auth\.uid\(\)\), display_name_input, theme_input\)/i);
  expect(sql).toMatch(/on conflict \(owner_id\) do update/i);
  expect(sql).toMatch(/security invoker/i);
  expect(sql).toMatch(/grant execute[^;]+to authenticated/i);
  expect(sql).not.toMatch(/security definer/i);
  expect(sql).not.toMatch(/\bto anon\b/i);
});

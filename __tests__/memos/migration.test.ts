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

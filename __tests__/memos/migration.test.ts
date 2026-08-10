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
